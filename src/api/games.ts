import { apiRequest } from "./client"
import type {
	GameCheckResponse,
	GameCheckResult,
	GameMode,
	GamePromptData,
	PromptDifficulty,
	RequestOptions,
} from "./types"

interface GenerateGamePromptInput extends RequestOptions {
	gameMode: GameMode | string
	difficulty: PromptDifficulty | string
}

interface CheckGameAnswerInput extends RequestOptions {
	gameMode: GameMode | string
	difficulty?: PromptDifficulty | string
	prompt: string
	answer: string
	challengeId?: string
}

interface CheckSandboxSentenceInput extends RequestOptions {
	answer: string
}

export async function generateGamePrompt({
	gameMode,
	difficulty,
	signal,
}: GenerateGamePromptInput): Promise<GamePromptData> {
	const params = new URLSearchParams({ mode: gameMode, difficulty })

	return apiRequest<GamePromptData>(`/games/prompt?${params}`, { signal })
}

export async function checkGameAnswer({
	gameMode,
	difficulty,
	prompt,
	answer,
	challengeId,
	signal,
}: CheckGameAnswerInput): Promise<GameCheckResult> {
	const body = gameCheckBody({ gameMode, difficulty, prompt, answer, challengeId })
	let data: GameCheckResponse

	try {
		data = await apiRequest<GameCheckResponse>("/games/check", {
			method: "POST",
			signal,
			body,
		})
	} catch (error) {
		if (!difficulty || !isUnsupportedDifficultyFieldError(error)) throw error

		data = await apiRequest<GameCheckResponse>("/games/check", {
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

function gameCheckBody({ gameMode, difficulty, prompt, answer, challengeId }: CheckGameAnswerInput) {
	return {
		mode: gameMode,
		...(difficulty ? { difficulty } : {}),
		prompt,
		answer,
		...(challengeId ? { challengeId } : {}),
	}
}

function isUnsupportedDifficultyFieldError(error: unknown) {
	const apiError = error as {
		status?: number
		message?: string
		data?: { error?: { message?: string } }
	}

	return (
		apiError?.status === 400 &&
		String(apiError.message || apiError.data?.error?.message || "").includes(
			'"difficulty" is not allowed',
		)
	)
}

export async function checkSandboxSentence({
	answer,
	signal,
}: CheckSandboxSentenceInput): Promise<Omit<GameCheckResult, "quota">> {
	const data = await apiRequest<GameCheckResponse>("/games/sandbox/check-japanese", {
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

export async function translateJapanese(
	text: string,
	{ signal }: RequestOptions = {},
): Promise<string> {
	const data = await apiRequest<{ translation?: string }>("/games/sandbox/translate-japanese", {
		method: "POST",
		signal,
		body: { text },
	})

	return data.translation || ""
}
