import { API_BASE_URL } from "./client"
import { checkGameAnswer } from "./games"

beforeEach(() => {
	global.fetch = jest.fn()
})

afterEach(() => {
	jest.restoreAllMocks()
})

test("checkGameAnswer sends difficulty with challenge checks", async () => {
	global.fetch.mockResolvedValue({
		ok: true,
		json: jest.fn().mockResolvedValue({
			correct: true,
			feedback: "Good.",
		}),
	})

	await expect(
		checkGameAnswer({
			gameMode: "translate",
			difficulty: "medium",
			prompt: "I eat rice.",
			answer: "ご飯を食べます。",
			challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
		}),
	).resolves.toEqual({
		correct: true,
		feedback: "Good.",
		quota: null,
	})

	expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/games/check`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			mode: "translate",
			difficulty: "medium",
			prompt: "I eat rice.",
			answer: "ご飯を食べます。",
			challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
		}),
	})
})

test("checkGameAnswer retries without difficulty against stale backends", async () => {
	global.fetch
		.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: jest.fn().mockResolvedValue({
				error: {
					message: '"difficulty" is not allowed',
				},
			}),
		})
		.mockResolvedValueOnce({
			ok: true,
			json: jest.fn().mockResolvedValue({
				correct: false,
				feedback: "Try again.",
			}),
		})

	await expect(
		checkGameAnswer({
			gameMode: "translate",
			difficulty: "easy",
			prompt: "I eat rice.",
			answer: "。",
			challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
		}),
	).resolves.toEqual({
		correct: false,
		feedback: "Try again.",
		quota: null,
	})

	expect(global.fetch).toHaveBeenCalledTimes(2)
	expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
		mode: "translate",
		difficulty: "easy",
		prompt: "I eat rice.",
		answer: "。",
		challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
	})
	expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({
		mode: "translate",
		prompt: "I eat rice.",
		answer: "。",
		challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
	})
})
