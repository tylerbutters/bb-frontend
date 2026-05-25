import { apiRequest } from "./client"

export async function generateTranslatePrompt(difficulty, { signal } = {}) {
	const params = new URLSearchParams({ difficulty })
	const data = await apiRequest(`/games/translate/prompt?${params}`, { signal })

	return data.sentence || ""
}

export async function checkTranslateAnswer({ prompt, answer, signal }) {
	const data = await apiRequest("/games/translate/check", {
		method: "POST",
		signal,
		body: {
			englishSentence: prompt,
			japaneseSentence: answer,
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
