import { useCallback, useEffect, useRef, useState } from "react"
import type { TouchEvent, WheelEvent } from "react"
import { Link } from "react-router-dom"
import { getErrorMessage } from "../../api/errors"
import { getUserGameHistory, getUserStats } from "../../api/users"
import type { GameHistoryItem, GameHistoryResponse, GameStats, User } from "../../api/types"
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
} from "../../gameStatsStorage"
import { CheckCircle2, Percent, Trophy, X, XCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import "./GameHistoryDrawer.css"

const HISTORY_PAGE_SIZE = 50
const HISTORY_DRAWER_ANIMATION_MS = 180

interface HistoryFilter {
	mode: string
	label: string
	difficulty: string
	recentLimit?: string
}

type HistorySource = "backend" | "local"
type HistoryStatus = "idle" | "loading" | "loadingMore" | "refreshing" | "ready" | "error"
type StatsStatus = "idle" | "loading" | "refreshing" | "ready"

function normalizeHistoryItem(item: GameHistoryItem): GameHistoryItem {
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

function normalizeHistoryResponse(history?: GameHistoryResponse | null): Required<GameHistoryResponse> {
	return {
		items: (history?.items || []).map(normalizeHistoryItem),
		hasMore: Boolean(history?.hasMore),
		nextOffset: history?.nextOffset ?? null,
	}
}

function hasHistory(history?: GameHistoryResponse | null) {
	return Array.isArray(history?.items) && history.items.length > 0
}

function getHistoryFilterKey({
	mode = "all",
	difficulty = "all",
	recentLimit = "all",
}: Partial<HistoryFilter> = {}) {
	return [mode, difficulty, recentLimit || "all"].join(":")
}

function emptyHistoryStats() {
	return normalizeGameStats()
}

function formatHistoryDate(value?: string) {
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

function HistoryStatMetric({
	icon: Icon,
	label,
	value,
}: {
	icon: LucideIcon
	label: string
	value: string | number
}) {
	return (
		<div className="statsMetric">
			<span className="statsMetricLabel">
				<Icon className="statsMetricIcon" size={16} aria-hidden="true" />
				{label}
			</span>
			<strong>{value}</strong>
		</div>
	)
}

export function useGameHistoryDrawer(currentUser?: User | null) {
	const [historyFilter, setHistoryFilter] = useState<HistoryFilter | null>(null)
	const [historyItems, setHistoryItems] = useState<GameHistoryItem[]>([])
	const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("idle")
	const [historyMessage, setHistoryMessage] = useState("")
	const [historyHasMore, setHistoryHasMore] = useState(false)
	const [historyNextOffset, setHistoryNextOffset] = useState<number | null>(0)
	const [historySource, setHistorySource] = useState<HistorySource>("backend")
	const [historyDataKey, setHistoryDataKey] = useState<string | null>(null)
	const [stats, setStats] = useState(() =>
		currentUser
			? getLocalGameStats(currentUser.id, {
					todayOnly: false,
				})
			: emptyGameStatsResponse(),
	)
	const [statsStatus, setStatsStatus] = useState<StatsStatus>("idle")
	const [isHistoryClosing, setIsHistoryClosing] = useState(false)
	const historyStatusRef = useRef(historyStatus)
	const statsStatusRef = useRef(statsStatus)
	const isFreeStatsLimited = false
	// TODO(premium): Re-enable free stats/history limits: currentUser?.plan !== "premium"

	useEffect(() => {
		historyStatusRef.current = historyStatus
	}, [historyStatus])

	useEffect(() => {
		statsStatusRef.current = statsStatus
	}, [statsStatus])

	const loadHistoryPage = useCallback(async ({
		filter = historyFilter,
		offset = 0,
		replace = false,
		signal,
		forceLocal = false,
		background = false,
	}: {
		filter?: HistoryFilter | null
		offset?: number
		replace?: boolean
		signal?: AbortSignal
		forceLocal?: boolean
		background?: boolean
	} = {}) => {
		if (!currentUser || !filter) return

		const filterKey = getHistoryFilterKey(filter)
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

	function applyHistory(nextHistory: GameHistoryResponse, source: HistorySource) {
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
			setHistoryDataKey(filterKey)
			setHistoryStatus("ready")
			setHistoryMessage("")
		}

		setHistoryStatus(background ? "refreshing" : replace ? "loading" : "loadingMore")
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
		} catch (error: any) {
			if (error.name === "AbortError") return

			if (background) {
				setHistoryStatus("ready")
				return
			}

			if (hasHistory(localHistory)) {
				applyHistory(localHistory, "local")
				return
			}

			setHistoryStatus("error")
			setHistoryMessage(getErrorMessage(error, "Could not load history."))
			setHistoryHasMore(false)
			setHistoryNextOffset(offset)
		}
	}, [currentUser, historyFilter, isFreeStatsLimited])

	useEffect(() => {
		if (!historyFilter || !currentUser) return
		if (isHistoryClosing) return

		const controller = new AbortController()
		const isBackgroundRefresh = historyStatusRef.current === "refreshing"
		loadHistoryPage({
			filter: historyFilter,
			offset: 0,
			replace: true,
			signal: controller.signal,
			forceLocal: false,
			background: isBackgroundRefresh,
		})

		return () => {
			controller.abort()
		}
	}, [currentUser, historyFilter, isFreeStatsLimited, isHistoryClosing, loadHistoryPage])

	useEffect(() => {
		if (!historyFilter || !currentUser) return
		if (isHistoryClosing) return

		const controller = new AbortController()
		const isBackgroundRefresh = statsStatusRef.current === "refreshing"
		const localStats = getLocalGameStats(currentUser.id, {
			todayOnly: isFreeStatsLimited,
		})
		if (!isBackgroundRefresh) {
			setStats(localStats)
		}

		async function loadStats() {
			setStatsStatus(isBackgroundRefresh ? "refreshing" : "loading")

			try {
				const nextStats = await getUserStats(currentUser.id, {
					signal: controller.signal,
				})
				if (controller.signal.aborted) return

				const normalizedStats = normalizeGameStatsResponse(nextStats, localStats)
				setStats(hasRecordedStats(normalizedStats) ? normalizedStats : localStats)
				setStatsStatus("ready")
			} catch (error: any) {
				if (error.name === "AbortError") return

				if (isBackgroundRefresh) {
					setStatsStatus("ready")
					return
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

	function openHistory({
		mode = "all",
		label,
		difficulty = "all",
		recentLimit = "all",
	}: Partial<HistoryFilter> & { label: string }) {
		const nextFilter = {
			mode,
			label,
			difficulty,
			recentLimit,
		}
		const hasCurrentData = historyDataKey === getHistoryFilterKey(nextFilter)

		setIsHistoryClosing(false)
		setHistoryFilter(nextFilter)
		setHistoryMessage("")

		if (!currentUser) {
			setStats(emptyGameStatsResponse())
			setStatsStatus("ready")
			setHistoryItems([])
			setHistoryStatus("ready")
			setHistoryHasMore(false)
			setHistoryNextOffset(0)
			setHistorySource("backend")
			setHistoryDataKey(null)
			return
		}

		if (hasCurrentData) {
			setStatsStatus("refreshing")
			setHistoryStatus("refreshing")
		} else {
			setStats(emptyGameStatsResponse())
			setStatsStatus("loading")
			setHistoryItems([])
			setHistoryStatus("loading")
			setHistoryHasMore(false)
			setHistoryNextOffset(0)
			setHistorySource("backend")
			setHistoryDataKey(null)
		}
	}

	function closeHistory() {
		if (!historyFilter || isHistoryClosing) return

		setIsHistoryClosing(true)
	}

	function finishClosingHistory() {
		setHistoryFilter(null)
		setHistoryMessage("")
		setIsHistoryClosing(false)
	}

	function selectHistoryDifficulty(difficulty: string) {
		if (!historyFilter || isHistoryClosing || historyFilter.difficulty === difficulty) return

		setStats(emptyGameStatsResponse())
		setStatsStatus("loading")
		setHistoryItems([])
		setHistoryStatus("loading")
		setHistoryMessage("")
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
		setHistorySource("backend")
		setHistoryDataKey(null)
		setHistoryFilter((currentFilter: HistoryFilter | null) =>
			currentFilter ? { ...currentFilter, difficulty } : currentFilter,
		)
	}

	function selectRecentLimit(recentLimit: string) {
		if (!historyFilter || isHistoryClosing || historyFilter.recentLimit === recentLimit) return

		setStats(emptyGameStatsResponse())
		setStatsStatus("loading")
		setHistoryItems([])
		setHistoryStatus("loading")
		setHistoryMessage("")
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
		setHistorySource("backend")
		setHistoryDataKey(null)
		setHistoryFilter((currentFilter: HistoryFilter | null) =>
			currentFilter ? { ...currentFilter, recentLimit } : currentFilter,
		)
	}

	function loadMoreHistory() {
		if (parseGameRecentLimit(historyFilter?.recentLimit || "all")) return

		loadHistoryPage({
			offset: historyNextOffset || 0,
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
			requiresLogin: Boolean(historyFilter && !currentUser),
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

interface GameHistoryDrawerProps {
	filter?: HistoryFilter | null
	recentFilters?: typeof GAME_RECENT_FILTERS
	stats?: GameStats | null
	isFreeStatsLimited?: boolean
	statsStatus: StatsStatus
	items: GameHistoryItem[]
	status: HistoryStatus
	message: string
	hasMore: boolean
	isClosing: boolean
	requiresLogin?: boolean
	onClose: () => void
	onCloseAnimationEnd: () => void
	onDifficultyChange: (difficulty: string) => void
	onRecentLimitChange: (recentLimit: string) => void
	onLoadMore: () => void
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
	requiresLogin = false,
	onClose,
	onCloseAnimationEnd,
	onDifficultyChange,
	onRecentLimitChange,
	onLoadMore,
}: GameHistoryDrawerProps) {
	if (!filter) return null

	const isLoading = status === "loading"
	const isLoadingMore = status === "loadingMore"
	const isError = status === "error"
	const normalizedStats =
		isLoading || statsStatus === "loading" ? emptyHistoryStats() : normalizeGameStats(stats)

	function preventFixedDrawerScroll(event: WheelEvent | TouchEvent) {
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
						</div>
						<button type="button" className="statsHistoryCloseButton" onClick={onClose}>
							<X className="statsHistoryButtonIcon" size={16} aria-hidden="true" />
							<span>Close</span>
						</button>
					</header>

					{/* TODO(premium): Re-enable this upgrade notice when history limits return.
						<section className="statsHistoryUpgradeNotice" aria-label="History limit">
							<div>
								<strong>Today only</strong>
								<p>Free accounts can see today's stats and history.</p>
							</div>
							<Link className="premiumButton" to="/buy">
								Buy premium
							</Link>
						</section>
					*/}

					{!requiresLogin && (
						<>
							<div className="filterTabsContainer">
								{GAME_STAT_FILTERS.map((difficulty) => (
									<button
										key={difficulty}
										type="button"
										role="tab"
										aria-selected={filter.difficulty === difficulty}
										className={`filterTab ${
											filter.difficulty === difficulty ? "filterTabSelected" : ""
										}`}
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
										aria-pressed={(filter.recentLimit || "all") === range.value}
										className={`filterTab ${
											(filter.recentLimit || "all") === range.value ? "filterTabSelected" : ""
										}`}
										onClick={() => onRecentLimitChange(range.value)}
									>
										{range.label}
									</button>
								))}
							</div>

							<div
								className="statsMetrics statsHistoryStats"
								role="group"
								aria-label={`${filter.label} history stats`}
								aria-busy={statsStatus === "loading" || statsStatus === "refreshing"}
							>
								<HistoryStatMetric
									icon={Trophy}
									label="Total games"
									value={normalizedStats.totalGames}
								/>
								<HistoryStatMetric
									icon={CheckCircle2}
									label="Correct"
									value={normalizedStats.correct}
								/>
								<HistoryStatMetric icon={XCircle} label="Incorrect" value={normalizedStats.incorrect} />
								<HistoryStatMetric
									icon={Percent}
									label="Accuracy"
									value={`${normalizedStats.accuracy}%`}
								/>
							</div>
						</>
					)}
				</div>
				<div className="statsHistoryScrollArea">
					{requiresLogin && (
						<div className="statsHistorySignupPrompt">
							<p>Sign up to see game history.</p>
							<Link className="statsHistorySignupButton" to="/signup">
								Sign up
							</Link>
						</div>
					)}
					{isLoading && (
						<div className="statsHistoryLoading" role="status" aria-label="Loading history">
							<span className="statsHistorySpinner" aria-hidden="true" />
						</div>
					)}
					{!requiresLogin && isError && <p className="statsHistoryMessage">{message}</p>}
					{!requiresLogin && !isLoading && !isError && items.length === 0 && (
						<p className="statsHistoryMessage">No history for this selection yet.</p>
					)}

					{!requiresLogin && !isLoading && (
						<div className="statsHistoryList">
							{items.map((item: GameHistoryItem) => (
								<article className="statsHistoryItem" key={item.id || item.challengeId}>
									<header className="statsHistoryItemHeader">
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: 10,
											}}
										>
											<time dateTime={item.createdAt}>{formatHistoryDate(item.createdAt)}</time>
											<div className="statsHistoryMeta">
												<span>{item.label}</span>
												<span>{item.difficulty || "Unknown difficulty"}</span>
											</div>
										</div>
										<span
											className={`statsHistoryResult ${
												item.correct ? "statsHistoryResultCorrect" : "statsHistoryResultIncorrect"
											}`}
										>
											{item.correct ? "Correct" : "Incorrect"}
										</span>
									</header>

									<dl className="statsHistoryDetails">
										<div>
											<dt>Prompt</dt>
											<dd>{item.prompt || "Prompt was not saved for this older game"}</dd>
										</div>
										<div>
											<dt>Your answer</dt>
											<dd>{item.answer || "Answer was not saved for this older game"}</dd>
										</div>
										{item.feedback && !item.correct && (
											<div>
												<dt>Feedback</dt>
												<dd>{item.feedback}</dd>
											</div>
										)}
									</dl>
								</article>
							))}
						</div>
					)}

					{!requiresLogin && hasMore && !isLoading && !isError && (
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
