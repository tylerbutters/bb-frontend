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

const trackedModeLabels = new Map(
	TRACKED_GAME_MODES.map((gameMode) => [gameMode.mode, gameMode.label]),
)
const validDifficulties = new Set(GAME_DIFFICULTIES)

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

function calculateAccuracy(won, totalGames) {
	if (!totalGames) return 0
	return Math.round((won / totalGames) * 100)
}

function createStats({ totalGames = 0, won = 0, failed = 0 } = {}) {
	return {
		totalGames,
		won,
		failed,
		accuracy: calculateAccuracy(won, totalGames),
	}
}

function normalizeDifficulty(difficulty) {
	return validDifficulties.has(difficulty) ? difficulty : null
}

function createModeAccumulator() {
	return new Map(
		TRACKED_GAME_MODES.map(({ mode }) => [
			mode,
			{ totalGames: 0, won: 0, failed: 0 },
		]),
	)
}

function addStats(statsByMode, { mode, correct }) {
	const stats = statsByMode.get(mode)
	if (!stats) return

	stats.totalGames += 1
	if (correct) {
		stats.won += 1
	} else {
		stats.failed += 1
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
			won: summary.won + game.won,
			failed: summary.failed + game.failed,
		}),
		{ totalGames: 0, won: 0, failed: 0 },
	)

	return {
		total: createStats(total),
		games,
	}
}

function challengeKey({ challengeId, mode, prompt }) {
	return challengeId || `${mode}:${prompt}`
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

export function getLocalGameStats(userId) {
	const results = Object.values(readStoredResults(userId))
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
	{ challengeId, mode, difficulty = "easy", prompt, correct },
) {
	if (!userId || !trackedModeLabels.has(mode)) return false

	const key = challengeKey({ challengeId, mode, prompt })
	if (!key) return false

	const results = readStoredResults(userId)
	if (results[key]) return false

	results[key] = {
		mode,
		difficulty: normalizeDifficulty(difficulty) || "easy",
		correct: Boolean(correct),
		recordedAt: new Date().toISOString(),
	}
	writeStoredResults(userId, results)

	return true
}
