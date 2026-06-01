import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { Search } from "lucide-react"
import {
	getAdminUser,
	getAdminUserGameHistory,
	getAdminUsers,
} from "../api/admin"
import {
	emptyGameStatsResponse,
	GAME_RECENT_FILTERS,
	GAME_STAT_FILTERS,
	getGameStatsFromHistoryItems,
	normalizeGameStats,
	normalizeGameStatsResponse,
	parseGameRecentLimit,
	TRACKED_GAME_MODES,
} from "../gameStatsStorage"
import "./AuthPage.css"
import "./StatsPage.css"
import "./GameHistoryDrawer.css"
import "./AdminPage.css"

const USER_PAGE_SIZE = 25
const HISTORY_PAGE_SIZE = 50
const MODE_FILTERS = [{ mode: "all", label: "All games" }, ...TRACKED_GAME_MODES]

function isAuthenticationError(error) {
	return error.status === 401
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
		createdAt: item?.createdAt || "",
	}
}

function normalizeHistoryResponse(history) {
	return {
		items: (history?.items || []).map(normalizeHistoryItem),
		hasMore: Boolean(history?.hasMore),
		nextOffset: history?.nextOffset ?? null,
	}
}

function formatDate(value) {
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

function formatValue(value) {
	return value || "None"
}

function StatMetric({ label, value }) {
	return (
		<div className="statsMetric">
			<span>{label}</span>
			<strong>{value}</strong>
		</div>
	)
}

function StatsSummary({ stats }) {
	const normalizedStats = normalizeGameStats(stats)

	return (
		<div className="statsMetrics">
			<StatMetric label="Total games" value={normalizedStats.totalGames} />
			<StatMetric label="Won" value={normalizedStats.won} />
			<StatMetric label="Failed" value={normalizedStats.failed} />
			<StatMetric label="Accuracy" value={`${normalizedStats.accuracy}%`} />
		</div>
	)
}

export default function AdminPage({ currentUser, onAuthExpired }) {
	const [searchInput, setSearchInput] = useState("")
	const [searchQuery, setSearchQuery] = useState("")
	const [users, setUsers] = useState([])
	const [usersStatus, setUsersStatus] = useState("idle")
	const [usersMessage, setUsersMessage] = useState("")
	const [usersHasMore, setUsersHasMore] = useState(false)
	const [usersNextOffset, setUsersNextOffset] = useState(0)
	const [selectedUserId, setSelectedUserId] = useState(null)
	const [selectedUser, setSelectedUser] = useState(null)
	const [stats, setStats] = useState(() => emptyGameStatsResponse())
	const [statsMode, setStatsMode] = useState("all")
	const [statsDifficulty, setStatsDifficulty] = useState("all")
	const [statsRecentRange, setStatsRecentRange] = useState("all")
	const [profileStatus, setProfileStatus] = useState("idle")
	const [profileMessage, setProfileMessage] = useState("")
	const [historyItems, setHistoryItems] = useState([])
	const [historyStatus, setHistoryStatus] = useState("idle")
	const [historyMessage, setHistoryMessage] = useState("")
	const [historyHasMore, setHistoryHasMore] = useState(false)
	const [historyNextOffset, setHistoryNextOffset] = useState(0)

	function handleApiError(error, setStatus, setMessage, fallbackMessage) {
		if (error.name === "AbortError") return

		if (isAuthenticationError(error)) {
			onAuthExpired?.()
			return
		}

		console.log(error)
		setStatus("error")
		setMessage(error.message || fallbackMessage)
	}

	async function loadUsersPage({ offset = 0, replace = false, signal } = {}) {
		if (!currentUser || currentUser.role !== "admin") return

		setUsersStatus(replace ? "loading" : "loadingMore")
		setUsersMessage("")

		try {
			const result = await getAdminUsers({
				query: searchQuery,
				limit: USER_PAGE_SIZE,
				offset,
				signal,
			})
			if (signal?.aborted) return

			const nextUsers = result.items || []
			setUsers((currentUsers) => (replace ? nextUsers : [...currentUsers, ...nextUsers]))
			setUsersHasMore(Boolean(result.hasMore))
			setUsersNextOffset(result.nextOffset ?? offset + nextUsers.length)
			setUsersStatus("ready")
		} catch (error) {
			handleApiError(error, setUsersStatus, setUsersMessage, "Could not load users.")
		}
	}

	async function loadHistoryPage({ offset = 0, replace = false, signal } = {}) {
		if (!selectedUserId) return

		setHistoryStatus(replace ? "loading" : "loadingMore")
		setHistoryMessage("")
		if (replace) {
			setHistoryItems([])
			setHistoryHasMore(false)
			setHistoryNextOffset(0)
		}

		try {
			const recentLimit = parseGameRecentLimit(statsRecentRange)
			const result = await getAdminUserGameHistory(selectedUserId, {
				mode: statsMode,
				difficulty: statsDifficulty,
				limit: recentLimit || HISTORY_PAGE_SIZE,
				offset,
				signal,
			})
			if (signal?.aborted) return

			const normalizedHistory = normalizeHistoryResponse(result)
			setHistoryItems((currentItems) =>
				replace
					? normalizedHistory.items
					: [...currentItems, ...normalizedHistory.items],
			)
			setHistoryHasMore(recentLimit ? false : normalizedHistory.hasMore)
			setHistoryNextOffset(
				recentLimit
					? null
					: (normalizedHistory.nextOffset ?? offset + normalizedHistory.items.length),
			)
			setHistoryStatus("ready")
		} catch (error) {
			handleApiError(error, setHistoryStatus, setHistoryMessage, "Could not load history.")
		}
	}

	useEffect(() => {
		if (!currentUser || currentUser.role !== "admin") return

		const controller = new AbortController()
		loadUsersPage({
			offset: 0,
			replace: true,
			signal: controller.signal,
		})

		return () => {
			controller.abort()
		}
	}, [currentUser, searchQuery])

	useEffect(() => {
		if (!selectedUserId) {
			setSelectedUser(null)
			setStats(emptyGameStatsResponse())
			setProfileStatus("idle")
			return
		}

		const controller = new AbortController()
		setProfileStatus("loading")
		setProfileMessage("")

		async function loadProfile() {
			try {
				const result = await getAdminUser(selectedUserId, {
					signal: controller.signal,
				})
				if (controller.signal.aborted) return

				setSelectedUser(result.user)
				setStats(normalizeGameStatsResponse(result.stats))
				setProfileStatus("ready")
			} catch (error) {
				setStats(emptyGameStatsResponse())
				handleApiError(
					error,
					setProfileStatus,
					setProfileMessage,
					"Could not load user profile.",
				)
			}
		}

		loadProfile()

		return () => {
			controller.abort()
		}
	}, [selectedUserId, onAuthExpired])

	useEffect(() => {
		if (!selectedUserId) {
			setHistoryItems([])
			setHistoryStatus("idle")
			setHistoryMessage("")
			setHistoryHasMore(false)
			setHistoryNextOffset(0)
			return
		}

		const controller = new AbortController()
		loadHistoryPage({
			offset: 0,
			replace: true,
			signal: controller.signal,
		})

		return () => {
			controller.abort()
		}
	}, [selectedUserId, statsMode, statsDifficulty, statsRecentRange])

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	if (currentUser.role !== "admin") {
		return (
			<div className="app accountPage adminPage">
				<main className="accountContent adminContent" aria-labelledby="admin-heading">
					<h1 id="admin-heading">Admin</h1>
					<section className="adminPanel adminAccessPanel" role="alert">
						<h2>Admin access required</h2>
						<p>403</p>
						<Link className="authPrimaryButton" to="/">
							Home
						</Link>
					</section>
				</main>
			</div>
		)
	}

	function submitSearch(event) {
		event.preventDefault()
		setSelectedUserId(null)
		setSearchQuery(searchInput.trim())
		setUsers([])
		setUsersHasMore(false)
		setUsersNextOffset(0)
	}

	function selectUser(user) {
		setSelectedUserId(user.id)
		setSelectedUser(user)
		setStats(emptyGameStatsResponse())
		setProfileStatus("loading")
		setProfileMessage("")
		setHistoryItems([])
		setHistoryStatus("loading")
		setHistoryMessage("")
		setHistoryHasMore(false)
		setHistoryNextOffset(0)
	}

	const recentLimit = parseGameRecentLimit(statsRecentRange)
	const profileStats =
		stats.byDifficulty?.[statsDifficulty] || stats.byDifficulty?.all || stats
	const selectedStats =
		recentLimit && selectedUserId
			? getGameStatsFromHistoryItems(historyItems)
			: statsMode === "all"
				? profileStats.total
				: (profileStats.games || []).find((game) => game.mode === statsMode)
	const selectedUserLabel = selectedUser
		? selectedUser.displayName || selectedUser.email
		: "No user selected"
	const isUsersLoading = usersStatus === "loading"
	const isUsersLoadingMore = usersStatus === "loadingMore"
	const isProfileLoading = profileStatus === "loading"
	const isHistoryLoading = historyStatus === "loading"
	const isHistoryLoadingMore = historyStatus === "loadingMore"

	return (
		<div className="app accountPage adminPage">
			<main className="accountContent adminContent" aria-labelledby="admin-heading">
				<h1 id="admin-heading">Admin</h1>

				<div className="adminLayout">
					<section className="adminPanel adminUsersPanel" aria-labelledby="admin-users-heading">
						<div className="adminPanelHeader">
							<h2 id="admin-users-heading">Users</h2>
						</div>
						<form className="adminSearchForm" aria-label="User search form" onSubmit={submitSearch}>
							<label htmlFor="admin-user-search">Search users</label>
							<div className="adminSearchRow">
								<input
									id="admin-user-search"
									type="search"
									value={searchInput}
									placeholder="Email or display name"
									onChange={(event) => setSearchInput(event.target.value)}
								/>
								<button type="submit" className="adminIconButton" aria-label="Search">
									<Search aria-hidden="true" />
								</button>
							</div>
						</form>

						{isUsersLoading && (
							<div className="adminLoading" role="status" aria-label="Loading users">
								<span className="statsHistorySpinner" aria-hidden="true" />
							</div>
						)}
						{usersStatus === "error" && (
							<p className="accountMessage accountMessageerror">{usersMessage}</p>
						)}
						{!isUsersLoading && usersStatus !== "error" && users.length === 0 && (
							<p className="accountMessage">No users found.</p>
						)}

						{!isUsersLoading && users.length > 0 && (
							<div className="adminUserList">
								{users.map((user) => (
									<button
										key={user.id}
										type="button"
										className={`adminUserRow ${
											String(selectedUserId) === String(user.id) ? "adminUserRowSelected" : ""
										}`}
										onClick={() => selectUser(user)}
									>
										<span className="adminUserName">{user.displayName || "Unnamed user"}</span>
										<span className="adminUserEmail">{user.email}</span>
										<span className="adminUserMeta">
											{user.plan || "free"} / {user.role || "user"}
										</span>
									</button>
								))}
							</div>
						)}

						{usersHasMore && usersStatus !== "error" && (
							<button
								type="button"
								className="statsHistoryLoadMoreButton"
								disabled={isUsersLoadingMore}
								onClick={() =>
									loadUsersPage({
										offset: usersNextOffset,
										replace: false,
									})
								}
							>
								{isUsersLoadingMore ? "Loading..." : "Load more"}
							</button>
						)}
					</section>

					<div className="adminMainColumn">
						<section className="adminPanel" aria-label="Selected user profile">
							<div className="adminPanelHeader">
								<h2>{selectedUserLabel}</h2>
							</div>
							{!selectedUserId && <p className="accountMessage">No user selected.</p>}
							{isProfileLoading && (
								<div className="adminLoading" role="status" aria-label="Loading user profile">
									<span className="statsHistorySpinner" aria-hidden="true" />
								</div>
							)}
							{profileStatus === "error" && (
								<p className="accountMessage accountMessageerror">{profileMessage}</p>
							)}
							{selectedUser && profileStatus !== "error" && (
								<div className="adminProfileGrid">
									<div className="adminProfileField">
										<span>Email</span>
										<strong>{formatValue(selectedUser.email)}</strong>
									</div>
									<div className="adminProfileField">
										<span>Display name</span>
										<strong>{formatValue(selectedUser.displayName)}</strong>
									</div>
									<div className="adminProfileField">
										<span>Plan</span>
										<strong>{formatValue(selectedUser.plan)}</strong>
									</div>
									<div className="adminProfileField">
										<span>Role</span>
										<strong>{formatValue(selectedUser.role)}</strong>
									</div>
									<div className="adminProfileField">
										<span>Created</span>
										<strong>{formatDate(selectedUser.createdAt)}</strong>
									</div>
									<div className="adminProfileField">
										<span>Updated</span>
										<strong>{formatDate(selectedUser.updatedAt)}</strong>
									</div>
								</div>
							)}
						</section>

						<section className="adminPanel" aria-label="Selected user stats">
							<div className="adminPanelHeader adminStatsHeader">
								<h2>Stats</h2>
								<div className="adminStatsFilters">
									<label>
										Mode
										<select
											aria-label="Stats mode"
											value={statsMode}
											disabled={!selectedUserId}
											onChange={(event) => setStatsMode(event.target.value)}
										>
											{MODE_FILTERS.map((mode) => (
												<option key={mode.mode} value={mode.mode}>
													{mode.label}
												</option>
											))}
										</select>
									</label>
								</div>
							</div>
							<div className="filterTabsContainer" role="tablist" aria-label="Admin stats difficulty">
								{GAME_STAT_FILTERS.map((difficulty) => (
									<button
										key={difficulty}
										type="button"
										role="tab"
										aria-selected={statsDifficulty === difficulty}
										className={`filterTab ${
											statsDifficulty === difficulty ? "filterTabSelected" : ""
										}`}
										disabled={!selectedUserId}
										onClick={() => setStatsDifficulty(difficulty)}
									>
										{difficulty}
									</button>
								))}
							</div>
							<div className="filterTabsContainer" aria-label="Admin stats range">
								{GAME_RECENT_FILTERS.map((range) => (
									<button
										key={range.value}
										type="button"
										aria-pressed={statsRecentRange === range.value}
										className={`filterTab ${
											statsRecentRange === range.value ? "filterTabSelected" : ""
										}`}
										disabled={!selectedUserId}
										onClick={() => setStatsRecentRange(range.value)}
									>
										{range.label}
									</button>
								))}
							</div>
							<StatsSummary stats={selectedStats} />
						</section>

						<section className="adminPanel" aria-label="Selected user game history">
							<div className="adminPanelHeader adminHistoryHeader">
								<h2>History</h2>
							</div>

							{!selectedUserId && <p className="accountMessage">No history loaded.</p>}
							{isHistoryLoading && (
								<div className="adminLoading" role="status" aria-label="Loading user history">
									<span className="statsHistorySpinner" aria-hidden="true" />
								</div>
							)}
							{historyStatus === "error" && (
								<p className="accountMessage accountMessageerror">{historyMessage}</p>
							)}
							{selectedUserId &&
								!isHistoryLoading &&
								historyStatus !== "error" &&
								historyItems.length === 0 && (
									<p className="accountMessage">No history for this selection.</p>
								)}

							{!isHistoryLoading && historyItems.length > 0 && (
								<div className="statsHistoryList adminHistoryList">
									{historyItems.map((item) => (
										<article className="statsHistoryItem" key={item.id || item.challengeId}>
											<header className="statsHistoryItemHeader">
												<time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
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
													<dd>{item.prompt || "Prompt was not saved for this older game"}</dd>
												</div>
												<div>
													<dt>Answer</dt>
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

							{historyHasMore && historyStatus !== "error" && (
								<button
									type="button"
									className="statsHistoryLoadMoreButton"
									disabled={isHistoryLoadingMore}
									onClick={() =>
										loadHistoryPage({
											offset: historyNextOffset,
											replace: false,
										})
									}
								>
									{isHistoryLoadingMore ? "Loading..." : "Load more"}
								</button>
							)}
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}
