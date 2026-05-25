import { ApiError, API_BASE_URL, apiRequest } from "./client"

beforeEach(() => {
	global.fetch = jest.fn()
})

afterEach(() => {
	jest.restoreAllMocks()
})

test("apiRequest sends JSON requests against the API base URL", async () => {
	global.fetch.mockResolvedValue({
		ok: true,
		json: jest.fn().mockResolvedValue({ user: { id: 1 } }),
	})

	await expect(
		apiRequest("users", {
			method: "POST",
			headers: {
				"X-Test": "true",
			},
			body: {
				email: "tyler@example.com",
			},
		}),
	).resolves.toEqual({ user: { id: 1 } })

	expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Test": "true",
		},
		body: JSON.stringify({
			email: "tyler@example.com",
		}),
	})
})

test("apiRequest preserves fetch signals", async () => {
	const controller = new AbortController()
	global.fetch.mockResolvedValue({
		ok: true,
		json: jest.fn().mockResolvedValue({ prompt: "I eat rice." }),
	})

	await apiRequest("/games/prompt?mode=translate&difficulty=easy", {
		signal: controller.signal,
	})

	expect(global.fetch).toHaveBeenCalledWith(
		`${API_BASE_URL}/games/prompt?mode=translate&difficulty=easy`,
		{
			method: "GET",
			headers: {},
			body: undefined,
			signal: controller.signal,
		},
	)
})

test("apiRequest throws ApiError with server error details", async () => {
	global.fetch.mockResolvedValue({
		ok: false,
		status: 422,
		json: jest.fn().mockResolvedValue({
			error: {
				message: "Email is invalid.",
			},
		}),
	})

	let error
	try {
		await apiRequest("/users", { method: "POST", body: {} })
	} catch (caughtError) {
		error = caughtError
	}

	expect(error).toBeInstanceOf(ApiError)
	expect(error).toMatchObject({
		name: "ApiError",
		message: "Email is invalid.",
		status: 422,
		data: {
			error: {
				message: "Email is invalid.",
			},
		},
	})
	expect(global.fetch).toHaveBeenCalledTimes(1)
})
