import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getUserGameHistory, getUserStats } from "../api/users"
import {
	emptyGameStatsResponse,
	GAME_RECENT_FILTERS,
	GAME_STAT_FILTERS,
	getGameStatsFromHistoryItems,
	getGameStatsForFilter,
	getLocalGameHistory,
	getLocalGameStats,
	hasRecordedStats,
	normalizeGameStats,
	normalizeGameStatsResponse,
	parseGameRecentLimit,
} from "../gameStatsStorage"
import "./GameHistoryDrawer.css"

const HISTORY_PAGE_SIZE = 50
const HISTORY_DRAWER_ANIMATION_MS = 180

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

export function useGameHistoryDrawer(currentUser) {
	const [historyFilter, setHistoryFilter] = useState(null)
	const [historyItems, setHistoryItems] = useState([])
	const [historyStatus, setHistoryStatus] = useState("idle")
	const [historyMessage, setHistoryMessage] = useState("")
	const [historyHasMore, setHistoryHasMore] = useState(false)
	const [historyNextOffset, setHistoryNextOffset] = useState(0)
	const [historySource, setHistorySource] = useState("backend")
	const [stats, setStats] = useState(() =>
		currentUser
			? getLocalGameStats(currentUser.id, {
					todayOnly: currentUser.plan !== "premium",
				})
			: emptyGameStatsResponse(),
	)
	const [statsStatus, setStatsStatus] = useState("idle")
	const [isHistoryClosing, setIsHistoryClosing] = useState(false)
	const isFreeStatsLimited = currentUser?.plan !== "premium"

	async function loadHistoryPage({
		filter = historyFilter,
		offset = 0,
		replace = false,
		signal,
		forceLocal = historySource === "local",
	} = {}) {
		if (!currentUser || !filter) return

		const recentLimit = parseGameRecentLimit(filter.recentLimit || "all")
		const query = {
			mode: filter.mode,
			difficulty: filter.difficulty,
			limit: recentLimit || HISTORY_PAGE_SIZE,
			offset,
		}
		const localHistory = getLocalGameHistory(currentUser.id, query, {
			todayOnly: isFreeStatsLimited,
		})

		function applyHistory(nextHistory, source) {
			const normalizedHistory = normalizeHistoryResponse(nextHistory)
			setHistoryItems((currentItems) =>
				replace ? normalizedHistory.items : [...currentItems, ...normalizedHistory.items],
			)
			setHistoryHasMore(recentLimit ? false : normalizedHistory.hasMore)
			setHistoryNextOffset(
				recentLimit
					? null
					: (normalizedHistory.nextOffset ?? offset + normalizedHistory.items.length),
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
	}, [currentUser, historyFilter, isFreeStatsLimited, isHistoryClosing])

	useEffect(() => {
		if (!historyFilter || !currentUser) return
		if (isHistoryClosing) return

		const controller = new AbortController()
		const localStats = getLocalGameStats(currentUser.id, {
			todayOnly: isFreeStatsLimited,
		})
		setStats(localStats)

		async function loadStats() {
			setStatsStatus("loading")

			try {
				const nextStats = await getUserStats(currentUser.id, {
					signal: controller.signal,
				})
				if (controller.signal.aborted) return

				const normalizedStats = normalizeGameStatsResponse(nextStats, localStats)
				setStats(hasRecordedStats(normalizedStats) ? normalizedStats : localStats)
				setStatsStatus("ready")
			} catch (error) {
				if (error.name === "AbortError") return

				if (error.status !== 404) {
					console.log(error)
				}
				setStats(localStats)
				setStatsStatus("ready")
			}
		}

		loadStats()

		return () => {
			controller.abort()
		}
	}, [currentUser, historyFilter, isFreeStatsLimited, isHistoryClosing])

	useEffect(() => {
		if (!isHistoryClosing) return

		const timeoutId = window.setTimeout(finishClosingHistory, HISTORY_DRAWER_ANIMATION_MS)

		return () => {
			window.clearTimeout(timeoutId)
		}
	}, [isHistoryClosing])

	function openHistory({ mode = "all", label, difficulty = "all", recentLimit = "all" }) {
		if (!currentUser) return

		setIsHistoryClosing(false)
		setHistoryFilter({
			mode,
			label,
			difficulty,
			recentLimit,
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
		setStatsStatus("idle")
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

	function selectRecentLimit(recentLimit) {
		if (!historyFilter || isHistoryClosing || historyFilter.recentLimit === recentLimit) return

		setHistoryItems([])
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
		setHistorySource("backend")
		setHistoryFilter((currentFilter) =>
			currentFilter ? { ...currentFilter, recentLimit } : currentFilter,
		)
	}

	function loadMoreHistory() {
		if (parseGameRecentLimit(historyFilter?.recentLimit || "all")) return

		loadHistoryPage({
			offset: historyNextOffset,
			replace: false,
			forceLocal: historySource === "local",
		})
	}

	return {
		closeHistory,
		drawerProps: {
			filter: historyFilter,
			recentFilters: GAME_RECENT_FILTERS,
			stats: parseGameRecentLimit(historyFilter?.recentLimit || "all")
				? getGameStatsFromHistoryItems(historyItems)
				: getGameStatsForFilter(stats, historyFilter || {}),
			isFreeStatsLimited,
			statsStatus,
			items: historyItems,
			status: historyStatus,
			message: historyMessage,
			hasMore: historyHasMore,
			isClosing: isHistoryClosing,
			onClose: closeHistory,
			onCloseAnimationEnd: finishClosingHistory,
			onDifficultyChange: selectHistoryDifficulty,
			onRecentLimitChange: selectRecentLimit,
			onLoadMore: loadMoreHistory,
		},
		isOpen: Boolean(historyFilter && !isHistoryClosing),
		openHistory,
	}
}

export function GameHistoryDrawer({
	filter,
	recentFilters = GAME_RECENT_FILTERS,
	stats,
	isFreeStatsLimited = false,
	statsStatus,
	items,
	status,
	message,
	hasMore,
	isClosing,
	onClose,
	onCloseAnimationEnd,
	onDifficultyChange,
	onRecentLimitChange,
	onLoadMore,
}) {
	if (!filter) return null

	const isLoading = status === "loading"
	const isLoadingMore = status === "loadingMore"
	const isError = status === "error"
	const normalizedStats = normalizeGameStats(stats)

	function preventFixedDrawerScroll(event) {
		const scrollArea =
			event.target instanceof Element ? event.target.closest(".statsHistoryScrollArea") : null

		if (scrollArea) return

		event.preventDefault()
		event.stopPropagation()
	}

	return (
		<div className="statsHistoryOverlay">
			<aside
				className={`statsHistoryDrawer ${isClosing ? "statsHistoryDrawerClosing" : ""}`}
				aria-label={`${filter.label} history drawer`}
				onAnimationEnd={isClosing ? onCloseAnimationEnd : undefined}
				onTouchMove={preventFixedDrawerScroll}
				onWheel={preventFixedDrawerScroll}
			>
				<div className="topPanel">
					<header className="statsHistoryHeader">
						<div>
							<h2>{filter.label} history</h2>
							<p>{filter.difficulty} difficulty</p>
						</div>
						<button type="button" className="statsHistoryCloseButton" onClick={onClose}>
							Close
						</button>
					</header>

					{isFreeStatsLimited && (
						<section className="statsHistoryUpgradeNotice" aria-label="History limit">
							<div>
								<strong>Today only</strong>
								<p>Free accounts can see today's stats and history.</p>
							</div>
							<Link className="premiumButton" to="/buy">
								Buy premium
							</Link>
						</section>
					)}

					<div className="filterTabsContainer">
						{GAME_STAT_FILTERS.map((difficulty) => (
							<button
								key={difficulty}
								type="button"
								className={`filterTab ${filter.difficulty === difficulty ? "filterTabSelected" : ""}`}
								style={{ padding: 5 }}
								onClick={() => onDifficultyChange(difficulty)}
							>
								{difficulty}
							</button>
						))}
					</div>

					<div className="filterTabsContainer">
						{recentFilters.map((range) => (
							<button
								key={range.value}
								type="button"
								className={`filterTab ${
									(filter.recentLimit || "all") === range.value ? "filterTabSelected" : ""
								}`}
								style={{ padding: 5 }}
								onClick={() => onRecentLimitChange(range.value)}
							>
								{range.label}
							</button>
						))}
					</div>

					<div
						className="statsMetrics"
						aria-label={`${filter.label} history stats`}
						aria-busy={statsStatus === "loading"}
					>
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
									<time dateTime={item.createdAt}>{formatHistoryDate(item.createdAt)}</time>
									<span
										className={`statsHistoryResult ${
											item.correct ? "statsHistoryResultCorrect" : "statsHistoryResultFailed"
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
										<dd>{item.prompt || "Prompt was not saved for this older game"}</dd>
									</div>
									<div>
										<dt>Your answer</dt>
										<dd>{item.answer || "Answer was not saved for this older game"}</dd>
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
