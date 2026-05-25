import { apiRequest } from "./client"

export async function generateGamePrompt({ gameMode, difficulty, signal }) {
	const params = new URLSearchParams({ mode: gameMode, difficulty })
	const data = await apiRequest(`/games/prompt?${params}`, { signal })

	return data.prompt || ""
}

export async function checkGameAnswer({ gameMode, prompt, answer, signal }) {
	const data = await apiRequest("/games/check", {
		method: "POST",
		signal,
		body: {
			mode: gameMode,
			prompt,
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
