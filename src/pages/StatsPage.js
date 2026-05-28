import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { getUserGameHistory, getUserStats } from "../api/users"
import {
	emptyGameStatsResponse,
	GAME_STAT_FILTERS,
	getLocalGameHistory,
	getLocalGameStats,
	hasRecordedStats,
} from "../gameStatsStorage"
import "./TopRightButton.css"
import "./AuthPage.css"

const HISTORY_PAGE_SIZE = 50
const HISTORY_DRAWER_ANIMATION_MS = 180

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

function normalizeHistoryItem(item) {
	return {
		id: item?.id || item?.challengeId || "",
		challengeId: item?.challengeId || "",
		mode: item?.mode || "",
		label: item?.label || item?.mode || "Game",
		difficulty: item?.difficulty || "",
		prompt: item?.prompt || "",
		answer: item?.answer || "",
		correct: Boolean(item?.correct),
		feedback: item?.feedback || "",
		createdAt: item?.createdAt || item?.recordedAt || "",
	}
}

function normalizeHistoryResponse(history) {
	return {
		items: (history?.items || []).map(normalizeHistoryItem),
		hasMore: Boolean(history?.hasMore),
		nextOffset: history?.nextOffset ?? null,
	}
}

function hasHistory(history) {
	return Array.isArray(history?.items) && history.items.length > 0
}

function formatHistoryDate(value) {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "Unknown date"

	return new Intl.DateTimeFormat("en", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date)
}

function HistoryDrawer({
	filter,
	items,
	status,
	message,
	hasMore,
	isClosing,
	onClose,
	onCloseAnimationEnd,
	onDifficultyChange,
	onLoadMore,
}) {
	if (!filter) return null

	const isLoading = status === "loading"
	const isLoadingMore = status === "loadingMore"
	const isError = status === "error"

	return (
		<div className="statsHistoryOverlay">
			<aside
				className={`statsHistoryDrawer ${
					isClosing ? "statsHistoryDrawerClosing" : ""
				}`}
				aria-label={`${filter.label} history drawer`}
				onAnimationEnd={isClosing ? onCloseAnimationEnd : undefined}
			>
				<header className="statsHistoryHeader">
					<div>
						<h2>{filter.label} history</h2>
						<p>{filter.difficulty} difficulty</p>
					</div>
					<button
						type="button"
						className="statsHistoryCloseButton"
						onClick={onClose}
					>
						Close
					</button>
				</header>

				<div
					className="statsDifficultyTabs statsHistoryDifficultyTabs"
					role="tablist"
					aria-label="History difficulty"
				>
					{GAME_STAT_FILTERS.map((difficulty) => (
						<button
							key={difficulty}
							type="button"
							role="tab"
							aria-selected={filter.difficulty === difficulty}
							className={`statsDifficultyTab ${
								filter.difficulty === difficulty ? "statsDifficultyTabSelected" : ""
							}`}
							onClick={() => onDifficultyChange(difficulty)}
						>
							{difficulty}
						</button>
					))}
				</div>

				<div className="statsHistoryScrollArea">
					{isLoading && <p className="statsHistoryMessage">Loading history...</p>}
					{isError && <p className="statsHistoryMessage">{message}</p>}
					{!isLoading && !isError && items.length === 0 && (
						<p className="statsHistoryMessage">No history for this selection yet.</p>
					)}

					<div className="statsHistoryList">
						{items.map((item) => (
							<article className="statsHistoryItem" key={item.id || item.challengeId}>
								<header className="statsHistoryItemHeader">
									<time dateTime={item.createdAt}>
										{formatHistoryDate(item.createdAt)}
									</time>
									<span
										className={`statsHistoryResult ${
											item.correct
												? "statsHistoryResultCorrect"
												: "statsHistoryResultFailed"
										}`}
									>
										{item.correct ? "Correct" : "Failed"}
									</span>
								</header>
								<div className="statsHistoryMeta">
									<span>{item.label}</span>
									<span>{item.difficulty || "Unknown difficulty"}</span>
								</div>
								<dl className="statsHistoryDetails">
									<div>
										<dt>Prompt</dt>
										<dd>
											{item.prompt ||
												"Prompt was not saved for this older game"}
										</dd>
									</div>
									<div>
										<dt>Your answer</dt>
										<dd>
											{item.answer ||
												"Answer was not saved for this older game"}
										</dd>
									</div>
									{item.feedback && (
										<div>
											<dt>Feedback</dt>
											<dd>{item.feedback}</dd>
										</div>
									)}
								</dl>
							</article>
						))}
					</div>

					{hasMore && !isLoading && !isError && (
						<button
							type="button"
							className="statsHistoryLoadMoreButton"
							onClick={onLoadMore}
							disabled={isLoadingMore}
						>
							{isLoadingMore ? "Loading..." : "Load more"}
						</button>
					)}
				</div>
			</aside>
		</div>
	)
}

export default function StatsPage({ currentUser }) {
	const [stats, setStats] = useState(() =>
		currentUser ? getLocalGameStats(currentUser.id) : emptyGameStatsResponse(),
	)
	const [selectedDifficulty, setSelectedDifficulty] = useState("all")
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")
	const [historyFilter, setHistoryFilter] = useState(null)
	const [historyItems, setHistoryItems] = useState([])
	const [historyStatus, setHistoryStatus] = useState("idle")
	const [historyMessage, setHistoryMessage] = useState("")
	const [historyHasMore, setHistoryHasMore] = useState(false)
	const [historyNextOffset, setHistoryNextOffset] = useState(0)
	const [historySource, setHistorySource] = useState("backend")
	const [isHistoryClosing, setIsHistoryClosing] = useState(false)
	const visibleStats = stats.byDifficulty?.[selectedDifficulty] || stats

	async function loadHistoryPage({
		filter = historyFilter,
		offset = 0,
		replace = false,
		signal,
		forceLocal = historySource === "local",
	} = {}) {
		if (!currentUser || !filter) return

		const query = {
			mode: filter.mode,
			difficulty: filter.difficulty,
			limit: HISTORY_PAGE_SIZE,
			offset,
		}
		const localHistory = getLocalGameHistory(currentUser.id, query)

		function applyHistory(nextHistory, source) {
			const normalizedHistory = normalizeHistoryResponse(nextHistory)
			setHistoryItems((currentItems) =>
				replace
					? normalizedHistory.items
					: [...currentItems, ...normalizedHistory.items],
			)
			setHistoryHasMore(normalizedHistory.hasMore)
			setHistoryNextOffset(
				normalizedHistory.nextOffset ?? offset + normalizedHistory.items.length,
			)
			setHistorySource(source)
			setHistoryStatus("ready")
			setHistoryMessage("")
		}

		setHistoryStatus(replace ? "loading" : "loadingMore")
		setHistoryMessage("")

		if (forceLocal) {
			applyHistory(localHistory, "local")
			return
		}

		try {
			const remoteHistory = await getUserGameHistory(currentUser.id, {
				...query,
				signal,
			})
			if (signal?.aborted) return

			const normalizedRemoteHistory = normalizeHistoryResponse(remoteHistory)
			if (offset === 0 && !hasHistory(normalizedRemoteHistory) && hasHistory(localHistory)) {
				applyHistory(localHistory, "local")
				return
			}

			applyHistory(normalizedRemoteHistory, "backend")
		} catch (error) {
			if (error.name === "AbortError") return

			if (hasHistory(localHistory)) {
				applyHistory(localHistory, "local")
				return
			}

			console.log(error)
			setHistoryStatus("error")
			setHistoryMessage(error.message || "Could not load history.")
			setHistoryHasMore(false)
			setHistoryNextOffset(offset)
		}
	}

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

	useEffect(() => {
		if (!historyFilter || !currentUser) return
		if (isHistoryClosing) return

		const controller = new AbortController()
		loadHistoryPage({
			filter: historyFilter,
			offset: 0,
			replace: true,
			signal: controller.signal,
			forceLocal: false,
		})

		return () => {
			controller.abort()
		}
	}, [currentUser, historyFilter, isHistoryClosing])

	useEffect(() => {
		if (!isHistoryClosing) return

		const timeoutId = window.setTimeout(
			finishClosingHistory,
			HISTORY_DRAWER_ANIMATION_MS,
		)

		return () => {
			window.clearTimeout(timeoutId)
		}
	}, [isHistoryClosing])

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	function openHistory({ mode = "all", label }) {
		setIsHistoryClosing(false)
		setHistoryFilter({
			mode,
			label,
			difficulty: selectedDifficulty,
		})
		setHistoryItems([])
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
		setHistorySource("backend")
	}

	function closeHistory() {
		if (!historyFilter || isHistoryClosing) return

		setIsHistoryClosing(true)
	}

	function finishClosingHistory() {
		setHistoryFilter(null)
		setHistoryItems([])
		setHistoryStatus("idle")
		setHistoryMessage("")
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
		setHistorySource("backend")
		setIsHistoryClosing(false)
	}

	function selectHistoryDifficulty(difficulty) {
		if (!historyFilter || isHistoryClosing || historyFilter.difficulty === difficulty) return

		setHistoryItems([])
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
		setHistorySource("backend")
		setHistoryFilter((currentFilter) =>
			currentFilter ? { ...currentFilter, difficulty } : currentFilter,
		)
	}

	function loadMoreHistory() {
		loadHistoryPage({
			offset: historyNextOffset,
			replace: false,
			forceLocal: historySource === "local",
		})
	}

	const statsPageClassName = `app accountPage statsPage ${
		historyFilter && !isHistoryClosing ? "statsPageHistoryOpen" : ""
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
					onHistoryClick={() => openHistory({ mode: "all", label: "All games" })}
				/>
				<div className="statsGameGrid">
					{visibleStats.games.map((game) => (
						<StatPanel
							key={game.mode}
							title={game.label}
							stats={game}
							onHistoryClick={() =>
								openHistory({ mode: game.mode, label: game.label })
							}
						/>
					))}
				</div>
			</main>
			<HistoryDrawer
				filter={historyFilter}
				items={historyItems}
				status={historyStatus}
				message={historyMessage}
				hasMore={historyHasMore}
				isClosing={isHistoryClosing}
				onClose={closeHistory}
				onCloseAnimationEnd={finishClosingHistory}
				onDifficultyChange={selectHistoryDifficulty}
				onLoadMore={loadMoreHistory}
			/>
		</div>
	)
}
