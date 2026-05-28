import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { getUserGameHistory, getUserStats } from "../api/users"
import {
	emptyGameStatsResponse,
	GAME_RECENT_FILTERS,
	GAME_STAT_FILTERS,
	getGameStatsGroupFromHistoryItems,
	getLocalGameHistory,
	getLocalGameStats,
	hasRecordedStats,
	normalizeGameStats,
	normalizeGameStatsResponse,
	parseGameRecentLimit,
} from "../gameStatsStorage"
import { GameHistoryDrawer, useGameHistoryDrawer } from "./GameHistoryDrawer"
import "./TopRightButton.css"
import "./AuthPage.css"

function StatPanel({ title, stats, onHistoryClick }) {
	const normalizedStats = normalizeGameStats(stats)

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

function hasHistoryItems(history) {
	return Array.isArray(history?.items) && history.items.length > 0
}

export default function StatsPage({ currentUser }) {
	const [stats, setStats] = useState(() =>
		currentUser ? getLocalGameStats(currentUser.id) : emptyGameStatsResponse(),
	)
	const [recentStats, setRecentStats] = useState(() => getGameStatsGroupFromHistoryItems())
	const [selectedDifficulty, setSelectedDifficulty] = useState("all")
	const [selectedRecentRange, setSelectedRecentRange] = useState("all")
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")
	const [recentStatus, setRecentStatus] = useState("idle")
	const [recentMessage, setRecentMessage] = useState("")
	const gameHistory = useGameHistoryDrawer(currentUser)
	const selectedRecentLimit = parseGameRecentLimit(selectedRecentRange)
	const visibleStats = selectedRecentLimit
		? recentStats
		: stats.byDifficulty?.[selectedDifficulty] || stats

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
				const normalizedStats = normalizeGameStatsResponse(nextStats, localStats)
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

	useEffect(() => {
		if (!currentUser) return

		if (!selectedRecentLimit) {
			setRecentStatus("idle")
			setRecentMessage("")
			setRecentStats(getGameStatsGroupFromHistoryItems())
			return
		}

		const controller = new AbortController()
		const query = {
			mode: "all",
			difficulty: selectedDifficulty,
			limit: selectedRecentLimit,
			offset: 0,
		}
		const localHistory = getLocalGameHistory(currentUser.id, query)

		async function loadRecentStats() {
			setRecentStatus("loading")
			setRecentMessage("")
			setRecentStats(getGameStatsGroupFromHistoryItems())

			try {
				const remoteHistory = await getUserGameHistory(currentUser.id, {
					...query,
					signal: controller.signal,
				})
				if (controller.signal.aborted) return

				const history =
					hasHistoryItems(remoteHistory) || !hasHistoryItems(localHistory)
						? remoteHistory
						: localHistory
				setRecentStats(getGameStatsGroupFromHistoryItems(history.items || []))
				setRecentStatus("ready")
			} catch (error) {
				if (error.name === "AbortError") return

				if (hasHistoryItems(localHistory) || error.status === 404) {
					setRecentStats(getGameStatsGroupFromHistoryItems(localHistory.items || []))
					setRecentStatus("ready")
					return
				}

				console.log(error)
				setRecentStats(getGameStatsGroupFromHistoryItems())
				setRecentStatus("error")
				setRecentMessage(error.message || "Could not load recent stats.")
			}
		}

		loadRecentStats()

		return () => {
			controller.abort()
		}
	}, [currentUser, selectedDifficulty, selectedRecentLimit])

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
				<div className="statsRangeTabs" aria-label="Stats range">
					{GAME_RECENT_FILTERS.map((range) => (
						<button
							key={range.value}
							type="button"
							className={`statsRangeButton ${
								selectedRecentRange === range.value ? "statsRangeButtonSelected" : ""
							}`}
							aria-pressed={selectedRecentRange === range.value}
							onClick={() => setSelectedRecentRange(range.value)}
						>
							{range.label}
						</button>
					))}
				</div>
				{status === "loading" && !selectedRecentLimit && (
					<p className="accountMessage">Loading stats...</p>
				)}
				{recentStatus === "loading" && selectedRecentLimit && (
					<p className="accountMessage">Loading recent stats...</p>
				)}
				{status === "error" && !selectedRecentLimit && (
					<p className="accountMessage accountMessageerror">{message}</p>
				)}
				{recentStatus === "error" && selectedRecentLimit && (
					<p className="accountMessage accountMessageerror">{recentMessage}</p>
				)}
				<StatPanel
					title="All games"
					stats={visibleStats.total}
					onHistoryClick={() =>
						gameHistory.openHistory({
							mode: "all",
							label: "All games",
							difficulty: selectedDifficulty,
							recentLimit: selectedRecentRange,
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
									recentLimit: selectedRecentRange,
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
