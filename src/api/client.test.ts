// @ts-nocheck
import { ApiError, API_BASE_URL, apiRequest } from "./client"
import { API_ERROR_TOAST_EVENT } from "./apiErrorToasts"

beforeEach(() => {
	global.fetch = jest.fn()
})

afterEach(() => {
	jest.restoreAllMocks()
})

function collectApiErrorToasts() {
	const toasts = []
	const listener = (event) => toasts.push(event.detail)
	window.addEventListener(API_ERROR_TOAST_EVENT, listener)

	return {
		toasts,
		stop: () => window.removeEventListener(API_ERROR_TOAST_EVENT, listener),
	}
}

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
		credentials: "include",
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
			credentials: "include",
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

test("apiRequest dispatches toasts for server API errors", async () => {
	const toastCollector = collectApiErrorToasts()
	global.fetch.mockResolvedValue({
		ok: false,
		status: 502,
		json: jest.fn().mockResolvedValue({
			error: {
				code: "AI_SERVICE_ERROR",
				message: "AI service failed.",
			},
		}),
	})

	try {
		await expect(apiRequest("/games/prompt")).rejects.toBeInstanceOf(ApiError)

		expect(toastCollector.toasts).toHaveLength(1)
		expect(toastCollector.toasts[0]).toMatchObject({
			type: "error",
			message: "The AI service is unavailable right now. Try again in a moment.",
		})
	} finally {
		toastCollector.stop()
	}
})

test("apiRequest dispatches toasts for network API errors", async () => {
	const toastCollector = collectApiErrorToasts()
	global.fetch.mockRejectedValue(new TypeError("Failed to fetch"))

	try {
		await expect(apiRequest("/games/prompt")).rejects.toThrow("Failed to fetch")

		expect(toastCollector.toasts).toHaveLength(1)
		expect(toastCollector.toasts[0]).toMatchObject({
			type: "error",
			message: "Could not reach the server. Check your connection and try again.",
		})
	} finally {
		toastCollector.stop()
	}
})

test("apiRequest does not dispatch toasts for handled form API errors", async () => {
	const toastCollector = collectApiErrorToasts()
	global.fetch.mockResolvedValue({
		ok: false,
		status: 422,
		json: jest.fn().mockResolvedValue({
			error: {
				code: "VALIDATION_ERROR",
				message: "Email is invalid.",
			},
		}),
	})

	try {
		await expect(apiRequest("/users", { method: "POST", body: {} })).rejects.toBeInstanceOf(
			ApiError,
		)

		expect(toastCollector.toasts).toHaveLength(0)
	} finally {
		toastCollector.stop()
	}
})
