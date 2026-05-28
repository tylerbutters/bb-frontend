import { apiRequest } from "./client"

export async function generateGamePrompt({ gameMode, difficulty, signal }) {
	const params = new URLSearchParams({ mode: gameMode, difficulty })

	return apiRequest(`/games/prompt?${params}`, { signal })
}

export async function checkGameAnswer({
	gameMode,
	difficulty,
	prompt,
	answer,
	challengeId,
	signal,
}) {
	const body = gameCheckBody({ gameMode, difficulty, prompt, answer, challengeId })
	let data

	try {
		data = await apiRequest("/games/check", {
			method: "POST",
			signal,
			body,
		})
	} catch (error) {
		if (!difficulty || !isUnsupportedDifficultyFieldError(error)) throw error

		data = await apiRequest("/games/check", {
			method: "POST",
			signal,
			body: gameCheckBody({ gameMode, prompt, answer, challengeId }),
		})
	}

	return {
		correct: Boolean(data.correct),
		feedback: data.feedback || "",
		quota: data.quota || null,
	}
}

function gameCheckBody({ gameMode, difficulty, prompt, answer, challengeId }) {
	return {
		mode: gameMode,
		...(difficulty ? { difficulty } : {}),
		prompt,
		answer,
		...(challengeId ? { challengeId } : {}),
	}
}

function isUnsupportedDifficultyFieldError(error) {
	return (
		error?.status === 400 &&
		String(error.message || error.data?.error?.message || "").includes(
			'"difficulty" is not allowed',
		)
	)
}

export async function checkSandboxSentence({ answer, signal }) {
	const data = await apiRequest("/games/sandbox/check-japanese", {
		method: "POST",
		signal,
		body: {
			answer,
		},
	})

	return {
		correct: Boolean(data.correct),
		feedback: data.feedback || "",
	}
}

export async function translateJapanese(text, { signal } = {}) {
	const data = await apiRequest("/games/sandbox/translate-japanese", {
		method: "POST",
		signal,
		body: { text },
	})

	return data.translation
}
