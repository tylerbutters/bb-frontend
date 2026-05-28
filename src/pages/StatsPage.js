import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { getUserStats } from "../api/users"
import {
	emptyGameStatsResponse,
	GAME_STAT_FILTERS,
	getLocalGameStats,
	hasRecordedStats,
} from "../gameStatsStorage"
import { GameHistoryDrawer, useGameHistoryDrawer } from "./GameHistoryDrawer"
import "./TopRightButton.css"
import "./AuthPage.css"

function normalizeStats(stats) {
	return {
		totalGames: Number(stats?.totalGames || 0),
		won: Number(stats?.won || 0),
		failed: Number(stats?.failed || 0),
		accuracy: Number(stats?.accuracy || 0),
	}
}

function StatPanel({ title, stats, onHistoryClick }) {
	const normalizedStats = normalizeStats(stats)

	return (
		<section className="statsPanel" aria-label={`${title} stats`}>
			<div className="statsPanelHeader">
				<h2>{title}</h2>
				<button
					type="button"
					className="statsHistoryButton"
					onClick={onHistoryClick}
				>
					History
				</button>
			</div>
			<div className="statsMetrics">
				<div className="statsMetric">
					<span>Total games</span>
					<strong>{normalizedStats.totalGames}</strong>
				</div>
				<div className="statsMetric">
					<span>Won</span>
					<strong>{normalizedStats.won}</strong>
				</div>
				<div className="statsMetric">
					<span>Failed</span>
					<strong>{normalizedStats.failed}</strong>
				</div>
				<div className="statsMetric">
					<span>Accuracy</span>
					<strong>{normalizedStats.accuracy}%</strong>
				</div>
			</div>
		</section>
	)
}

function normalizeStatsGroup(statsGroup, fallbackStatsGroup = emptyGameStatsResponse()) {
	const statsByMode = new Map((statsGroup?.games || []).map((game) => [game.mode, game]))

	return {
		total: normalizeStats(statsGroup?.total || fallbackStatsGroup.total),
		games: fallbackStatsGroup.games.map((fallbackGameStats) => ({
			...fallbackGameStats,
			...normalizeStats(statsByMode.get(fallbackGameStats.mode) || fallbackGameStats),
		})),
	}
}

function normalizeStatsResponse(stats, fallbackStats = emptyGameStatsResponse()) {
	const emptyStats = emptyGameStatsResponse()
	const fallbackByDifficulty = fallbackStats.byDifficulty || emptyStats.byDifficulty
	const sourceByDifficulty = stats?.byDifficulty || {}
	const byDifficulty = Object.fromEntries(
		GAME_STAT_FILTERS.map((difficulty) => {
			const sourceStats =
				difficulty === "all"
					? sourceByDifficulty.all || {
							total: stats?.total,
							games: stats?.games,
						}
					: sourceByDifficulty[difficulty]

			return [
				difficulty,
				normalizeStatsGroup(
					sourceStats,
					fallbackByDifficulty[difficulty] || emptyStats.byDifficulty[difficulty],
				),
			]
		}),
	)

	return {
		...byDifficulty.all,
		byDifficulty,
	}
}

export default function StatsPage({ currentUser }) {
	const [stats, setStats] = useState(() =>
		currentUser ? getLocalGameStats(currentUser.id) : emptyGameStatsResponse(),
	)
	const [selectedDifficulty, setSelectedDifficulty] = useState("all")
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")
	const gameHistory = useGameHistoryDrawer(currentUser)
	const visibleStats = stats.byDifficulty?.[selectedDifficulty] || stats

	useEffect(() => {
		if (!currentUser) return

		const controller = new AbortController()
		const localStats = getLocalGameStats(currentUser.id)
		setStats(localStats)

		async function loadStats() {
			setStatus("loading")
			setMessage("")

			try {
				const nextStats = await getUserStats(currentUser.id, { signal: controller.signal })
				if (controller.signal.aborted) return
				const normalizedStats = normalizeStatsResponse(nextStats, localStats)
				setStats(hasRecordedStats(normalizedStats) ? normalizedStats : localStats)
				setStatus("ready")
			} catch (error) {
				if (error.name === "AbortError") return

				if (error.status === 404) {
					setStats(localStats)
					setStatus("ready")
					return
				}

				console.log(error)
				setStatus("error")
				setMessage(error.message || "Could not load stats.")
			}
		}

		loadStats()

		return () => {
			controller.abort()
		}
	}, [currentUser])

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	const statsPageClassName = `app accountPage statsPage ${
		gameHistory.isOpen ? "statsPageHistoryOpen" : ""
	}`

	return (
		<div className={statsPageClassName}>
			<Link className="topRightButton" to="/">
				Back
			</Link>

			<main className="accountContent statsContent" aria-labelledby="stats-heading">
				<h1 id="stats-heading">Stats</h1>
				<div className="statsDifficultyTabs" role="tablist" aria-label="Stats difficulty">
					{GAME_STAT_FILTERS.map((difficulty) => (
						<button
							key={difficulty}
							type="button"
							role="tab"
							aria-selected={selectedDifficulty === difficulty}
							className={`statsDifficultyTab ${
								selectedDifficulty === difficulty ? "statsDifficultyTabSelected" : ""
							}`}
							onClick={() => setSelectedDifficulty(difficulty)}
						>
							{difficulty}
						</button>
					))}
				</div>
				{status === "loading" && <p className="accountMessage">Loading stats...</p>}
				{status === "error" && (
					<p className="accountMessage accountMessageerror">{message}</p>
				)}
				<StatPanel
					title="All games"
					stats={visibleStats.total}
					onHistoryClick={() =>
						gameHistory.openHistory({
							mode: "all",
							label: "All games",
							difficulty: selectedDifficulty,
						})
					}
				/>
				<div className="statsGameGrid">
					{visibleStats.games.map((game) => (
						<StatPanel
							key={game.mode}
							title={game.label}
							stats={game}
							onHistoryClick={() =>
								gameHistory.openHistory({
									mode: game.mode,
									label: game.label,
									difficulty: selectedDifficulty,
								})
							}
						/>
					))}
				</div>
			</main>
			<GameHistoryDrawer {...gameHistory.drawerProps} />
		</div>
	)
}
