const STORAGE_KEY_PREFIX = "bbLocalGameResults"

export const TRACKED_GAME_MODES = [
	{ mode: "translate", label: "Translate" },
	{ mode: "conjugations", label: "Conjugations" },
	{ mode: "fix sentence", label: "Fix sentence" },
	{ mode: "particles", label: "Particles" },
	{ mode: "reorder", label: "Reorder" },
]
export const GAME_DIFFICULTIES = ["easy", "medium", "hard"]
export const GAME_STAT_FILTERS = ["all", ...GAME_DIFFICULTIES]
export const GAME_RECENT_FILTERS = [
	{ value: "all", label: "all" },
	{ value: "10", label: "past 10" },
	{ value: "20", label: "past 20" },
	{ value: "50", label: "past 50" },
]

const trackedModeLabels = new Map(
	TRACKED_GAME_MODES.map((gameMode) => [gameMode.mode, gameMode.label]),
)
const validDifficulties = new Set(GAME_DIFFICULTIES)
const HISTORY_PAGE_SIZE = 50

function storageKey(userId) {
	return `${STORAGE_KEY_PREFIX}:${userId}`
}

function readStoredResults(userId) {
	if (!userId) return {}

	try {
		const storedValue = window.localStorage.getItem(storageKey(userId))
		const parsedValue = storedValue ? JSON.parse(storedValue) : null
		return parsedValue && typeof parsedValue.results === "object" ? parsedValue.results : {}
	} catch {
		return {}
	}
}

function writeStoredResults(userId, results) {
	window.localStorage.setItem(storageKey(userId), JSON.stringify({ results }))
}

function utcDayRange(date = new Date()) {
	const start = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	)
	const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

	return { start, end }
}

function isFromCurrentUtcDay(value, now = new Date()) {
	const time = Date.parse(value)
	if (!time) return false

	const { start, end } = utcDayRange(now)
	return time >= start.getTime() && time < end.getTime()
}

function filterTodayResults(results, { todayOnly = false, now = new Date() } = {}) {
	if (!todayOnly) return results

	return results.filter((result) => isFromCurrentUtcDay(result.recordedAt, now))
}

function calculateAccuracy(correct, totalGames) {
	if (!totalGames) return 0
	return Math.round((correct / totalGames) * 100)
}

function createStats({ totalGames = 0, correct = 0, incorrect = 0 } = {}) {
	return {
		totalGames,
		correct,
		incorrect,
		accuracy: calculateAccuracy(correct, totalGames),
	}
}

export function normalizeGameStats(stats) {
	return {
		totalGames: Number(stats?.totalGames || 0),
		correct: Number(stats?.correct || 0),
		incorrect: Number(stats?.incorrect || 0),
		accuracy: Number(stats?.accuracy || 0),
	}
}

export function getGameStatsFromHistoryItems(items = []) {
	const totalGames = items.length
	const correct = items.filter((item) => item.correct).length
	const incorrect = totalGames - correct

	return createStats({ totalGames, correct, incorrect })
}

export function getGameStatsGroupFromHistoryItems(items = []) {
	const statsByMode = createModeAccumulator()

	for (const item of items) {
		addStats(statsByMode, {
			mode: item.mode,
			correct: Boolean(item.correct),
		})
	}

	return createStatsGroup(statsByMode)
}

export function parseGameRecentLimit(value) {
	if (value === "all") return null

	const limit = Number(value)
	return Number.isFinite(limit) && limit > 0 ? limit : null
}

function normalizeDifficulty(difficulty) {
	return validDifficulties.has(difficulty) ? difficulty : null
}

function createModeAccumulator() {
	return new Map(
		TRACKED_GAME_MODES.map(({ mode }) => [
			mode,
			{ totalGames: 0, correct: 0, incorrect: 0 },
		]),
	)
}

function addStats(statsByMode, { mode, correct }) {
	const stats = statsByMode.get(mode)
	if (!stats) return

	stats.totalGames += 1
	if (correct) {
		stats.correct += 1
	} else {
		stats.incorrect += 1
	}
}

function createStatsGroup(statsByMode = createModeAccumulator()) {
	const games = TRACKED_GAME_MODES.map(({ mode, label }) => ({
		mode,
		label,
		...createStats(statsByMode.get(mode)),
	}))
	const total = games.reduce(
		(summary, game) => ({
			totalGames: summary.totalGames + game.totalGames,
			correct: summary.correct + game.correct,
			incorrect: summary.incorrect + game.incorrect,
		}),
		{ totalGames: 0, correct: 0, incorrect: 0 },
	)

	return {
		total: createStats(total),
		games,
	}
}

export function normalizeGameStatsGroup(statsGroup, fallbackStatsGroup = createStatsGroup()) {
	const statsByMode = new Map((statsGroup?.games || []).map((game) => [game.mode, game]))
	const fallbackByMode = new Map(
		(fallbackStatsGroup?.games || createStatsGroup().games).map((game) => [
			game.mode,
			game,
		]),
	)

	return {
		total: normalizeGameStats(statsGroup?.total || fallbackStatsGroup?.total),
		games: TRACKED_GAME_MODES.map(({ mode, label }) => {
			const fallbackGameStats = fallbackByMode.get(mode) || {
				mode,
				label,
				...createStats(),
			}
			const sourceGameStats = statsByMode.get(mode) || fallbackGameStats

			return {
				mode,
				label,
				...normalizeGameStats(sourceGameStats),
			}
		}),
	}
}

export function normalizeGameStatsResponse(stats, fallbackStats = emptyGameStatsResponse()) {
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
				normalizeGameStatsGroup(
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

export function getGameStatsForFilter(
	stats,
	{ mode = "all", difficulty = "all" } = {},
) {
	const normalizedStats = normalizeGameStatsResponse(stats)
	const statsGroup =
		normalizedStats.byDifficulty?.[difficulty] ||
		normalizedStats.byDifficulty?.all ||
		normalizedStats

	if (mode === "all") return normalizeGameStats(statsGroup.total)

	return normalizeGameStats(
		(statsGroup.games || []).find((gameStats) => gameStats.mode === mode),
	)
}

function challengeKey({ challengeId, mode, prompt }) {
	return challengeId || `${mode}:${prompt}`
}

function modeLabel(mode) {
	return trackedModeLabels.get(mode) || mode
}

function normalizeHistoryItem(result, key) {
	return {
		id: key,
		challengeId: result.challengeId || key,
		mode: result.mode,
		label: modeLabel(result.mode),
		difficulty: normalizeDifficulty(result.difficulty),
		prompt: result.prompt || "",
		answer: result.answer || "",
		correct: Boolean(result.correct),
		feedback: result.feedback || "",
		createdAt: result.recordedAt || "",
	}
}

export function emptyGameStatsResponse() {
	const byDifficulty = Object.fromEntries(
		GAME_STAT_FILTERS.map((difficulty) => [difficulty, createStatsGroup()]),
	)

	return {
		...byDifficulty.all,
		byDifficulty,
	}
}

export function getLocalGameStats(userId, options = {}) {
	const results = filterTodayResults(Object.values(readStoredResults(userId)), options)
	const statsByFilter = new Map(
		GAME_STAT_FILTERS.map((difficulty) => [difficulty, createModeAccumulator()]),
	)

	for (const result of results) {
		if (!trackedModeLabels.has(result.mode)) continue

		const difficulty = normalizeDifficulty(result.difficulty)
		const rowStats = {
			mode: result.mode,
			correct: Boolean(result.correct),
		}

		addStats(statsByFilter.get("all"), rowStats)
		if (difficulty) addStats(statsByFilter.get(difficulty), rowStats)
	}

	const byDifficulty = Object.fromEntries(
		GAME_STAT_FILTERS.map((difficulty) => [
			difficulty,
			createStatsGroup(statsByFilter.get(difficulty)),
		]),
	)

	return {
		...byDifficulty.all,
		byDifficulty,
	}
}

export function hasRecordedStats(stats) {
	return Number(stats?.total?.totalGames || stats?.byDifficulty?.all?.total?.totalGames || 0) > 0
}

export function recordLocalGameResult(
	userId,
	{ challengeId, mode, difficulty = "easy", prompt, answer, correct, feedback },
) {
	if (!userId || !trackedModeLabels.has(mode)) return false

	const key = challengeKey({ challengeId, mode, prompt })
	if (!key) return false

	const results = readStoredResults(userId)
	if (results[key]) return false

	results[key] = {
		challengeId: challengeId || "",
		mode,
		difficulty: normalizeDifficulty(difficulty) || "easy",
		prompt: prompt || "",
		answer: answer || "",
		correct: Boolean(correct),
		feedback: feedback || "",
		recordedAt: new Date().toISOString(),
	}
	writeStoredResults(userId, results)

	return true
}

export function getLocalGameHistory(
	userId,
	{ mode = "all", difficulty = "all", limit = HISTORY_PAGE_SIZE, offset = 0 } = {},
	options = {},
) {
	const normalizedLimit = Math.min(Math.max(Number(limit) || HISTORY_PAGE_SIZE, 1), 100)
	const normalizedOffset = Math.max(Number(offset) || 0, 0)
	const items = Object.entries(readStoredResults(userId))
		.filter(
			([, result]) =>
				!options.todayOnly || isFromCurrentUtcDay(result.recordedAt, options.now),
		)
		.map(([key, result]) => normalizeHistoryItem(result, key))
		.filter((item) => trackedModeLabels.has(item.mode))
		.filter((item) => mode === "all" || item.mode === mode)
		.filter((item) => difficulty === "all" || item.difficulty === difficulty)
		.sort((firstItem, secondItem) => {
			const firstTime = Date.parse(firstItem.createdAt) || 0
			const secondTime = Date.parse(secondItem.createdAt) || 0
			return secondTime - firstTime
		})
	const pageItems = items.slice(normalizedOffset, normalizedOffset + normalizedLimit)
	const nextOffset = normalizedOffset + normalizedLimit

	return {
		items: pageItems,
		hasMore: nextOffset < items.length,
		nextOffset: nextOffset < items.length ? nextOffset : null,
	}
}
