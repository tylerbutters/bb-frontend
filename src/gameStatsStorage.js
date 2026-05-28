const STORAGE_KEY_PREFIX = "bbLocalGameResults"

export const TRACKED_GAME_MODES = [
	{ mode: "translate", label: "Translate" },
	{ mode: "conjugations", label: "Conjugations" },
	{ mode: "fix sentence", label: "Fix sentence" },
	{ mode: "particles", label: "Particles" },
	{ mode: "reorder", label: "Reorder" },
]

const EMPTY_STATS = {
	totalGames: 0,
	won: 0,
	failed: 0,
	accuracy: 0,
}
const trackedModeLabels = new Map(
	TRACKED_GAME_MODES.map((gameMode) => [gameMode.mode, gameMode.label]),
)

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

function challengeKey({ challengeId, mode, prompt }) {
	return challengeId || `${mode}:${prompt}`
}

export function emptyGameStatsResponse() {
	return {
		total: { ...EMPTY_STATS },
		games: TRACKED_GAME_MODES.map((gameMode) => ({
			...gameMode,
			...EMPTY_STATS,
		})),
	}
}

export function getLocalGameStats(userId) {
	const results = Object.values(readStoredResults(userId))
	const statsByMode = new Map(
		TRACKED_GAME_MODES.map(({ mode }) => [
			mode,
			{ totalGames: 0, won: 0, failed: 0 },
		]),
	)

	for (const result of results) {
		const stats = statsByMode.get(result.mode)
		if (!stats) continue

		stats.totalGames += 1
		if (result.correct) {
			stats.won += 1
		} else {
			stats.failed += 1
		}
	}

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

export function hasRecordedStats(stats) {
	return Number(stats?.total?.totalGames || 0) > 0
}

export function recordLocalGameResult(userId, { challengeId, mode, prompt, correct }) {
	if (!userId || !trackedModeLabels.has(mode)) return false

	const key = challengeKey({ challengeId, mode, prompt })
	if (!key) return false

	const results = readStoredResults(userId)
	if (results[key]) return false

	results[key] = {
		mode,
		correct: Boolean(correct),
		recordedAt: new Date().toISOString(),
	}
	writeStoredResults(userId, results)

	return true
}
