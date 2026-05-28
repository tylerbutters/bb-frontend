import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { getUserStats } from "../api/users"
import {
	emptyGameStatsResponse,
	getLocalGameStats,
	hasRecordedStats,
} from "../gameStatsStorage"
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

function StatPanel({ title, stats }) {
	const normalizedStats = normalizeStats(stats)

	return (
		<section className="statsPanel" aria-label={`${title} stats`}>
			<h2>{title}</h2>
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

function normalizeStatsResponse(stats, fallbackStats = emptyGameStatsResponse()) {
	const statsByMode = new Map((stats?.games || []).map((game) => [game.mode, game]))

	return {
		total: normalizeStats(stats?.total || fallbackStats.total),
		games: fallbackStats.games.map((fallbackGameStats) => ({
			...fallbackGameStats,
			...normalizeStats(statsByMode.get(fallbackGameStats.mode) || fallbackGameStats),
		})),
	}
}

export default function StatsPage({ currentUser }) {
	const [stats, setStats] = useState(() =>
		currentUser ? getLocalGameStats(currentUser.id) : emptyGameStatsResponse(),
	)
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")

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

	return (
		<div className="app accountPage statsPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>

			<main className="accountContent statsContent" aria-labelledby="stats-heading">
				<h1 id="stats-heading">Stats</h1>
				{status === "loading" && <p className="accountMessage">Loading stats...</p>}
				{status === "error" && (
					<p className="accountMessage accountMessageerror">{message}</p>
				)}
				<StatPanel title="All games" stats={stats.total} />
				<div className="statsGameGrid">
					{stats.games.map((game) => (
						<StatPanel key={game.mode} title={game.label} stats={game} />
					))}
				</div>
			</main>
		</div>
	)
}
