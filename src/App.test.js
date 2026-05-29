import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { API_BASE_URL } from "./api/client"
import App from "./App"

beforeAll(() => {
	class MockIntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}

	global.IntersectionObserver = MockIntersectionObserver
	global.ResizeObserver = MockIntersectionObserver
})

const defaultStatsResponse = {
	total: {
		totalGames: 6,
		won: 4,
		failed: 2,
		accuracy: 67,
	},
	games: [
		{
			mode: "translate",
			label: "Translate",
			totalGames: 3,
			won: 2,
			failed: 1,
			accuracy: 67,
		},
		{
			mode: "conjugations",
			label: "Conjugations",
			totalGames: 1,
			won: 1,
			failed: 0,
			accuracy: 100,
		},
		{
			mode: "fix sentence",
			label: "Fix sentence",
			totalGames: 0,
			won: 0,
			failed: 0,
			accuracy: 0,
		},
		{
			mode: "particles",
			label: "Particles",
			totalGames: 2,
			won: 1,
			failed: 1,
			accuracy: 50,
		},
		{
			mode: "reorder",
			label: "Reorder",
			totalGames: 0,
			won: 0,
			failed: 0,
			accuracy: 0,
		},
	],
	byDifficulty: {
		all: {
			total: {
				totalGames: 6,
				won: 4,
				failed: 2,
				accuracy: 67,
			},
			games: [
				{
					mode: "translate",
					label: "Translate",
					totalGames: 3,
					won: 2,
					failed: 1,
					accuracy: 67,
				},
				{
					mode: "conjugations",
					label: "Conjugations",
					totalGames: 1,
					won: 1,
					failed: 0,
					accuracy: 100,
				},
				{
					mode: "fix sentence",
					label: "Fix sentence",
					totalGames: 0,
					won: 0,
					failed: 0,
					accuracy: 0,
				},
				{
					mode: "particles",
					label: "Particles",
					totalGames: 2,
					won: 1,
					failed: 1,
					accuracy: 50,
				},
				{
					mode: "reorder",
					label: "Reorder",
					totalGames: 0,
					won: 0,
					failed: 0,
					accuracy: 0,
				},
			],
		},
		easy: {
			total: {
				totalGames: 2,
				won: 1,
				failed: 1,
				accuracy: 50,
			},
			games: [
				{
					mode: "translate",
					label: "Translate",
					totalGames: 2,
					won: 1,
					failed: 1,
					accuracy: 50,
				},
			],
		},
		medium: {
			total: {
				totalGames: 3,
				won: 3,
				failed: 0,
				accuracy: 100,
			},
			games: [
				{
					mode: "conjugations",
					label: "Conjugations",
					totalGames: 1,
					won: 1,
					failed: 0,
					accuracy: 100,
				},
				{
					mode: "particles",
					label: "Particles",
					totalGames: 2,
					won: 2,
					failed: 0,
					accuracy: 100,
				},
			],
		},
		hard: {
			total: {
				totalGames: 1,
				won: 0,
				failed: 1,
				accuracy: 0,
			},
			games: [
				{
					mode: "particles",
					label: "Particles",
					totalGames: 1,
					won: 0,
					failed: 1,
					accuracy: 0,
				},
			],
		},
	},
}
const defaultQuotaResponse = {
	plan: "free",
	limit: 3,
	used: 1,
	remaining: 2,
	resetsAt: "2026-05-29T00:00:00.000Z",
	canPlay: true,
}
const firstChallengeId = "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95"
const secondChallengeId = "2e5eb8e7-f91a-4c61-8f37-62b1a27ddf95"

async function loginDefaultUser() {
	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
		expect(window.location.pathname).toBe("/")
	})
}

function expectLoggedOutChallengeBlocker() {
	const blocker = screen
		.getByText("Log in to check challenge answers.")
		.closest(".gameQuotaBlocker")
	expect(blocker).toBeInTheDocument()
	expect(within(blocker).getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login")
	expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument()
}

beforeEach(() => {
	window.history.pushState({}, "", "/")
	window.localStorage.clear()
	let mockCurrentUser = {
		id: 1,
		email: "tyler@example.com",
		displayName: "Tyler",
	}
	global.fetch = jest.fn((url, options = {}) => {
		if (url === `${API_BASE_URL}/users/signup-confirmation/request`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					message: "Confirmation code sent. Check your email to finish creating your account.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/signup-confirmation/confirm`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					message: "Confirmation code sent. Check your email to finish creating your account.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: mockCurrentUser,
				}),
			})
		}

		if (url === `${API_BASE_URL}/login/password-reset/request`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					message: "If an account exists for that email, a reset code has been sent.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/login/password-reset/confirm`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					message: "Password reset successful.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1` && options.method === "PATCH") {
			const accountChanges = JSON.parse(options.body)
			delete accountChanges.currentPassword
			delete accountChanges.password
			mockCurrentUser = {
				...mockCurrentUser,
				...accountChanges,
			}

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					message: "Account updated.",
					user: mockCurrentUser,
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1` && options.method === "DELETE") {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					message: "Account deleted.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/stats`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(defaultStatsResponse),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(defaultQuotaResponse),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/users/1/game-history`)) {
			const requestUrl = new URL(String(url), "http://localhost")
			const difficulty = requestUrl.searchParams.get("difficulty")
			const offset = Number(requestUrl.searchParams.get("offset") || 0)
			let items = []
			let hasMore = false
			let nextOffset = null

			if (difficulty === "medium") {
				items = [
					{
						id: 5,
						challengeId: "3e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
						mode: "translate",
						label: "Translate",
						difficulty: "medium",
						prompt: "I write a letter.",
						answer: "手紙を書きます。",
						correct: true,
						feedback: "Nice.",
						createdAt: "2026-05-26T10:00:00.000Z",
					},
				]
			} else if (offset === 0) {
				items = [
					{
						id: 7,
						challengeId: "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
						mode: "translate",
						label: "Translate",
						difficulty: "easy",
						prompt: "I eat rice.",
						answer: "ご飯を食べます。",
						correct: true,
						feedback: "Good.",
						createdAt: "2026-05-28T10:00:00.000Z",
					},
				]
				hasMore = true
				nextOffset = 50
			} else {
				items = [
					{
						id: 6,
						challengeId: "2e5eb8e7-f91a-4c61-8f37-62b1a27ddf95",
						mode: "translate",
						label: "Translate",
						difficulty: "easy",
						prompt: "I drink tea.",
						answer: "お茶を飲みます。",
						correct: false,
						feedback: "Use お茶.",
						createdAt: "2026-05-27T10:00:00.000Z",
					},
				]
			}

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					items,
					hasMore,
					nextOffset,
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: "I eat rice.",
					challengeId: firstChallengeId,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})
})

afterEach(() => {
	jest.restoreAllMocks()
	jest.useRealTimers()
})

test("renders the initial add button", () => {
	render(<App />)
	expect(screen.getByRole("button", { name: "+ word" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Bunsho Builder" })).toHaveAttribute("href", "/")
	expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about")
	expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
})

test("opens the about page", () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "About" }))

	expect(window.location.pathname).toBe("/about")
	expect(screen.getByRole("heading", { name: "About Bunsho Builder" })).toBeInTheDocument()
	expect(screen.getByText(/practice sentence structure/)).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "support@bunshobuilder.com" })).toHaveAttribute(
		"href",
		"mailto:support@bunshobuilder.com",
	)
	expect(screen.getByRole("link", { name: "Bunsho Builder" })).toHaveAttribute("href", "/")
})

test("opens the buy premium page", () => {
	window.history.pushState({}, "", "/buy")

	render(<App />)

	expect(screen.getByRole("heading", { name: "Buy premium" })).toBeInTheDocument()
	expect(screen.getByText("Checkout is coming soon.")).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "Buy premium" })).toBeDisabled()
	expect(screen.getByRole("link", { name: "Bunsho Builder" })).toHaveAttribute("href", "/")
})

test("opens the sign up page, confirms the email code, and creates an account", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Sign up" }))

	expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Bunsho Builder" })).toHaveAttribute("href", "/")
	expect(screen.getByText(/Already have an account\?/)).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login")
	expect(window.location.pathname).toBe("/signup")

	fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Tyler" } })
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Send code" }))

	await waitFor(() => {
		expect(screen.getByRole("heading", { name: "Confirm email" })).toBeInTheDocument()
	})
	const signupNotice = screen.getByText("tyler@example.com").closest(".resetEmailNotice")
	expect(signupNotice).toHaveTextContent("Email sent to tyler@example.com. Change details")
	expect(signupNotice).toContainElement(screen.getByRole("button", { name: "Change details" }))
	expect(screen.getByLabelText("Code")).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "Resend code in 30s" })).toBeDisabled()
	expect(
		screen.getByText("Confirmation code sent. Check your email to finish creating your account."),
	).toBeInTheDocument()

	const signupRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/users/signup-confirmation/request`,
	)
	expect(signupRequest[1]).toMatchObject({
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	})
	expect(JSON.parse(signupRequest[1].body)).toEqual({
		displayName: "Tyler",
		email: "tyler@example.com",
		password: "password1",
	})

	fireEvent.change(screen.getByLabelText("Code"), { target: { value: "123456" } })
	fireEvent.click(screen.getByRole("button", { name: "Create account" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})
	expect(window.location.pathname).toBe("/")

	const confirmSignupRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/users/signup-confirmation/confirm`,
	)
	expect(confirmSignupRequest[1]).toMatchObject({
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	})
	expect(JSON.parse(confirmSignupRequest[1].body)).toEqual({
		email: "tyler@example.com",
		code: "123456",
	})
})

test("renders the sign up page at the sign up route", () => {
	window.history.pushState({}, "", "/signup")

	render(<App />)

	expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.getByLabelText("Display name")).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	const passwordInput = screen.getByLabelText("Password")
	expect(passwordInput).toHaveAttribute("type", "password")

	fireEvent.click(screen.getByRole("button", { name: "Show password" }))
	expect(passwordInput).toHaveAttribute("type", "text")
	expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
		"aria-pressed",
		"true",
	)
})

test("opens the login page", () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))

	expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Bunsho Builder" })).toHaveAttribute("href", "/")
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	const passwordInput = screen.getByLabelText("Password")
	expect(passwordInput).toHaveAttribute("type", "password")
	fireEvent.click(screen.getByRole("button", { name: "Show password" }))
	expect(passwordInput).toHaveAttribute("type", "text")
	expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup")
	expect(window.location.pathname).toBe("/login")
})

test("requests a reset code and resets the password from the login page", async () => {
	jest.useFakeTimers()

	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.click(screen.getByRole("link", { name: "Forgot password?" }))

	expect(screen.getByRole("heading", { name: "Reset Password" })).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toHaveValue("")
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })

	fireEvent.click(screen.getByRole("button", { name: "Send code" }))

	await waitFor(() => {
		expect(screen.getByLabelText("Code")).toBeInTheDocument()
	})
	const resetEmailNotice = screen.getByText("tyler@example.com").closest(".resetEmailNotice")
	expect(resetEmailNotice).toHaveTextContent("Email sent to tyler@example.com. Change email")
	expect(resetEmailNotice).toContainElement(screen.getByRole("button", { name: "Change email" }))
	expect(screen.queryByLabelText("Email")).not.toBeInTheDocument()
	expect(
		screen.getByText("If an account exists for that email, a reset code has been sent."),
	).toBeInTheDocument()
	const resetRequestCalls = () =>
		global.fetch.mock.calls.filter(
			([url]) => url === `${API_BASE_URL}/login/password-reset/request`,
		)

	let resendButton = screen.getByRole("button", { name: "Resend code in 30s" })
	expect(resendButton).toBeDisabled()
	fireEvent.click(resendButton)
	expect(resetRequestCalls()).toHaveLength(1)

	for (let seconds = 0; seconds < 30; seconds += 1) {
		await act(async () => {
			jest.advanceTimersByTime(1000)
		})
	}

	resendButton = screen.getByRole("button", { name: "Resend code" })
	expect(resendButton).toBeEnabled()
	fireEvent.change(screen.getByLabelText("Code"), { target: { value: "111111" } })
	fireEvent.click(resendButton)

	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Resend code in 30s" })).toBeDisabled()
	})
	expect(screen.getByLabelText("Code")).toHaveValue("")
	expect(resetRequestCalls()).toHaveLength(2)
	expect(JSON.parse(resetRequestCalls()[1][1].body)).toEqual({
		email: "tyler@example.com",
	})

	fireEvent.change(screen.getByLabelText("Code"), { target: { value: "123456" } })
	fireEvent.change(screen.getByLabelText("New password"), { target: { value: "password2" } })
	fireEvent.change(screen.getByLabelText("Confirm new password"), {
		target: { value: "password2" },
	})
	fireEvent.click(screen.getByRole("button", { name: "Reset password" }))

	await waitFor(() => {
		expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
	})
	expect(
		screen.getByText("Password reset successful. You can log in with your new password."),
	).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toHaveValue("tyler@example.com")

	const requestResetRequest = resetRequestCalls()[0]
	expect(JSON.parse(requestResetRequest[1].body)).toEqual({
		email: "tyler@example.com",
	})

	const confirmResetRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/login/password-reset/confirm`,
	)
	expect(JSON.parse(confirmResetRequest[1].body)).toEqual({
		email: "tyler@example.com",
		code: "123456",
		password: "password2",
	})
})

test("logs in and replaces auth links with the user name", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})
	expect(window.location.pathname).toBe("/")
	expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument()
	expect(screen.queryByRole("link", { name: "Sign up" })).not.toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Stats" })).toHaveAttribute("href", "/stats")
	expect(screen.getByRole("link", { name: "PREMIUM" })).toHaveAttribute("href", "/buy")
	expect(screen.queryByRole("menuitem", { name: "Stats" })).not.toBeInTheDocument()
	expect(screen.queryByRole("menuitem", { name: "Log out" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("link", { name: "Account" }))
	expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Log out" }))
	expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.queryByRole("link", { name: "Account" })).not.toBeInTheDocument()
	expect(window.localStorage.getItem("jsbCurrentUser")).toBeNull()

	const loginRequest = global.fetch.mock.calls.find(([url]) => url === `${API_BASE_URL}/login`)
	expect(loginRequest[1]).toMatchObject({
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	})
	expect(JSON.parse(loginRequest[1].body)).toEqual({
		email: "tyler@example.com",
		password: "password1",
	})
})

test("opens account from the user menu and updates account details", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("link", { name: "Account" }))

	expect(window.location.pathname).toBe("/account")
	expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument()
	expect(screen.getByLabelText("Display name")).toHaveValue("Tyler")
	expect(screen.getByLabelText("Email")).toHaveValue("tyler@example.com")
	expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument()
	expect(screen.getAllByRole("button", { name: "Save changes" })).toHaveLength(3)

	const displayNameSection = screen.getByRole("form", { name: "Display name settings" })
	const emailSection = screen.getByRole("form", { name: "Email settings" })
	const passwordSection = screen.getByRole("form", { name: "Password settings" })

	fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Taylor" } })
	fireEvent.click(within(displayNameSection).getByRole("button", { name: "Save changes" }))

	await waitFor(() => {
		expect(within(displayNameSection).getByText("Account updated.")).toBeInTheDocument()
	})

	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "taylor@example.com" } })
	fireEvent.click(within(emailSection).getByRole("button", { name: "Save changes" }))

	await waitFor(() => {
		expect(
			within(emailSection).getByText("A verification link has been sent to tyler@example.com"),
		).toBeInTheDocument()
	})

	fireEvent.change(screen.getByLabelText("New password"), { target: { value: "password2" } })
	fireEvent.change(screen.getByLabelText("Confirm new password"), {
		target: { value: "password2" },
	})
	fireEvent.change(screen.getByLabelText("Current password"), {
		target: { value: "password1" },
	})
	expect(within(passwordSection).getAllByRole("button", { name: /password/i })).toHaveLength(3)
	fireEvent.click(screen.getByRole("button", { name: "Show current password" }))
	expect(screen.getByLabelText("Current password")).toHaveAttribute("type", "text")
	expect(screen.getByRole("button", { name: "Hide current password" })).toBeInTheDocument()
	expect(screen.getByLabelText("New password")).toHaveAttribute("type", "password")
	expect(screen.getByLabelText("Confirm new password")).toHaveAttribute("type", "password")
	fireEvent.click(screen.getByRole("button", { name: "Show new password" }))
	fireEvent.click(screen.getByRole("button", { name: "Show confirm new password" }))
	expect(screen.getByLabelText("New password")).toHaveAttribute("type", "text")
	expect(screen.getByLabelText("Confirm new password")).toHaveAttribute("type", "text")
	fireEvent.click(within(passwordSection).getByRole("button", { name: "Save changes" }))

	await waitFor(() => {
		expect(within(passwordSection).getByText("Account updated.")).toBeInTheDocument()
	})

	const accountRequests = global.fetch.mock.calls.filter(
		([url, options]) => url === `${API_BASE_URL}/users/1` && options.method === "PATCH",
	)
	const emailChangeRequests = global.fetch.mock.calls.filter(
		([url, options]) =>
			url === `${API_BASE_URL}/users/1/email-change/request` && options.method === "POST",
	)
	expect(accountRequests).toHaveLength(2)
	expect(emailChangeRequests).toHaveLength(1)
	expect(accountRequests[0][1]).toMatchObject({
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
	})
	expect(accountRequests.map(([, options]) => JSON.parse(options.body))).toEqual([
		{ displayName: "Taylor" },
		{ currentPassword: "password1", password: "password2" },
	])
	expect(JSON.parse(emailChangeRequests[0][1].body)).toEqual({
		email: "taylor@example.com",
	})
	expect(screen.getByLabelText("Current password")).toHaveValue("")
	expect(screen.getByLabelText("New password")).toHaveValue("")
	expect(screen.getByLabelText("Confirm new password")).toHaveValue("")
	expect(JSON.parse(window.localStorage.getItem("jsbCurrentUser"))).toEqual({
		id: 1,
		email: "tyler@example.com",
		displayName: "Taylor",
	})

	fireEvent.click(screen.getByRole("link", { name: "Bunsho Builder" }))
	expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
})

test("deletes an account from the account page", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("link", { name: "Account" }))
	fireEvent.click(screen.getByRole("button", { name: "Delete account" }))

	expect(screen.getByRole("button", { name: "Confirm delete" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
	expect(screen.queryByRole("button", { name: "Confirm delete" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Delete account" }))
	fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }))

	await waitFor(() => {
		expect(window.location.pathname).toBe("/login")
	})

	const deleteRequest = global.fetch.mock.calls.find(
		([url, options]) => url === `${API_BASE_URL}/users/1` && options.method === "DELETE",
	)
	expect(deleteRequest[1]).toMatchObject({
		method: "DELETE",
	})
	expect(window.localStorage.getItem("jsbCurrentUser")).toBeNull()
	expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
})

test("opens stats from the top nav", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("link", { name: "Stats" }))

	await waitFor(() => {
		expect(screen.getByRole("heading", { name: "Stats" })).toBeInTheDocument()
	})
	expect(window.location.pathname).toBe("/stats")

	const statsLimitNotice = screen.getByLabelText("Stats limit")
	expect(within(statsLimitNotice).getByText("Today only")).toBeInTheDocument()
	expect(
		within(statsLimitNotice).getByText("Free accounts can see today's stats and history."),
	).toBeInTheDocument()
	expect(within(statsLimitNotice).getByRole("link", { name: "Buy premium" })).toHaveAttribute(
		"href",
		"/buy",
	)

	const allGamesPanel = screen.getByLabelText("All games stats")
	await waitFor(() => {
		expect(within(allGamesPanel).getByText("6")).toBeInTheDocument()
	})
	expect(within(allGamesPanel).getByText("Total games")).toBeInTheDocument()
	expect(within(allGamesPanel).getByText("4")).toBeInTheDocument()
	expect(within(allGamesPanel).getByText("2")).toBeInTheDocument()
	expect(within(allGamesPanel).getByText("67%")).toBeInTheDocument()
	expect(screen.getByLabelText("Translate stats")).toBeInTheDocument()
	expect(screen.getByLabelText("Fix sentence stats")).toHaveTextContent("0%")
	expect(screen.getByRole("tab", { name: "all" })).toHaveAttribute("aria-selected", "true")
	expect(screen.getByRole("tab", { name: "easy" })).toBeInTheDocument()
	expect(screen.getByRole("tab", { name: "medium" })).toBeInTheDocument()
	expect(screen.getByRole("tab", { name: "hard" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "all" })).toHaveAttribute("aria-pressed", "true")
	expect(screen.getByRole("button", { name: "past 10" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "past 20" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "past 50" })).toBeInTheDocument()

	fireEvent.click(screen.getByRole("tab", { name: "easy" }))
	expect(screen.getByRole("tab", { name: "easy" })).toHaveAttribute("aria-selected", "true")
	expect(allGamesPanel).toHaveTextContent(/Total games\s*2/)
	expect(allGamesPanel).toHaveTextContent(/Won\s*1/)
	expect(allGamesPanel).toHaveTextContent(/Failed\s*1/)
	expect(allGamesPanel).toHaveTextContent(/Accuracy\s*50%/)
	expect(screen.getByLabelText("Translate stats")).toHaveTextContent("50%")
	expect(screen.getByLabelText("Conjugations stats")).toHaveTextContent("0%")

	fireEvent.click(screen.getByRole("tab", { name: "medium" }))
	expect(allGamesPanel).toHaveTextContent(/Total games\s*3/)
	expect(allGamesPanel).toHaveTextContent(/Won\s*3/)
	expect(allGamesPanel).toHaveTextContent(/Failed\s*0/)
	expect(allGamesPanel).toHaveTextContent(/Accuracy\s*100%/)

	fireEvent.click(screen.getByRole("tab", { name: "hard" }))
	expect(allGamesPanel).toHaveTextContent(/Total games\s*1/)
	expect(allGamesPanel).toHaveTextContent(/Won\s*0/)
	expect(allGamesPanel).toHaveTextContent(/Failed\s*1/)
	expect(allGamesPanel).toHaveTextContent(/Accuracy\s*0%/)

	fireEvent.click(screen.getByRole("tab", { name: "all" }))
	await waitFor(() => {
		expect(allGamesPanel).toHaveTextContent(/Total games\s*6/)
	})
	fireEvent.click(screen.getByRole("button", { name: "past 10" }))
	expect(screen.getByRole("button", { name: "past 10" })).toHaveAttribute("aria-pressed", "true")
	await waitFor(() => {
		expect(allGamesPanel).toHaveTextContent(/Total games\s*1/)
	})
	expect(allGamesPanel).toHaveTextContent(/Won\s*1/)
	expect(allGamesPanel).toHaveTextContent(/Failed\s*0/)
	expect(allGamesPanel).toHaveTextContent(/Accuracy\s*100%/)
	expect(screen.getByLabelText("Translate stats")).toHaveTextContent("100%")
	expect(screen.getByLabelText("Particles stats")).toHaveTextContent("0%")

	const recentStatsRequest = global.fetch.mock.calls
		.filter(([url]) => String(url).startsWith(`${API_BASE_URL}/users/1/game-history`))
		.at(-1)
	const recentStatsParams = new URL(String(recentStatsRequest[0]), "http://localhost").searchParams
	expect(recentStatsParams.get("mode")).toBe("all")
	expect(recentStatsParams.get("difficulty")).toBe("all")
	expect(recentStatsParams.get("limit")).toBe("10")
	expect(recentStatsParams.get("offset")).toBe("0")

	fireEvent.click(screen.getByRole("button", { name: "all" }))
	await waitFor(() => {
		expect(allGamesPanel).toHaveTextContent(/Total games\s*6/)
	})

	const statsRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/users/1/stats`,
	)
	expect(statsRequest[1]).toMatchObject({
		method: "GET",
	})
})

test("opens paginated game history from a stats panel", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("link", { name: "Stats" }))
	await waitFor(() => {
		expect(screen.getByRole("heading", { name: "Stats" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("tab", { name: "easy" }))
	const translatePanel = screen.getByLabelText("Translate stats")
	fireEvent.click(within(translatePanel).getByRole("button", { name: "History" }))

	const drawer = await screen.findByLabelText("Translate history drawer")
	expect(document.body.style.overflow).toBe("")
	expect(document.querySelector(".statsPage")).toHaveClass("statsPageHistoryOpen")
	expect(within(drawer).getByRole("heading", { name: "Translate history" })).toBeInTheDocument()
	const historyLimitNotice = within(drawer).getByLabelText("History limit")
	expect(within(historyLimitNotice).getByText("Today only")).toBeInTheDocument()
	expect(
		within(historyLimitNotice).getByText("Free accounts can see today's stats and history."),
	).toBeInTheDocument()
	expect(within(historyLimitNotice).getByRole("link", { name: "Buy premium" })).toHaveAttribute(
		"href",
		"/buy",
	)
	expect(within(drawer).getByText("easy difficulty")).toBeInTheDocument()
	expect(within(drawer).getByRole("tab", { name: "easy" })).toHaveAttribute("aria-selected", "true")
	const historyStats = within(drawer).getByRole("group", {
		name: "Translate history stats",
	})
	await waitFor(() => {
		expect(historyStats).toHaveTextContent(/Total games\s*2/)
	})
	expect(historyStats).toHaveTextContent(/Won\s*1/)
	expect(historyStats).toHaveTextContent(/Failed\s*1/)
	expect(historyStats).toHaveTextContent(/Accuracy\s*50%/)
	expect(within(drawer).getByRole("button", { name: "all" })).toHaveAttribute(
		"aria-pressed",
		"true",
	)
	expect(within(drawer).getByText("I eat rice.")).toBeInTheDocument()
	expect(within(drawer).getByText("ご飯を食べます。")).toBeInTheDocument()
	expect(within(drawer).getByText("Correct")).toBeInTheDocument()
	expect(within(drawer).getByText("Good.")).toBeInTheDocument()

	const firstHistoryRequest = global.fetch.mock.calls.find(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/users/1/game-history`),
	)
	const firstHistoryParams = new URL(String(firstHistoryRequest[0]), "http://localhost")
		.searchParams
	expect(firstHistoryParams.get("mode")).toBe("translate")
	expect(firstHistoryParams.get("difficulty")).toBe("easy")
	expect(firstHistoryParams.get("limit")).toBe("50")
	expect(firstHistoryParams.get("offset")).toBe("0")

	fireEvent.click(within(drawer).getByRole("button", { name: "past 10" }))
	expect(within(drawer).getByRole("button", { name: "past 10" })).toHaveAttribute(
		"aria-pressed",
		"true",
	)
	await waitFor(() => {
		expect(historyStats).toHaveTextContent(/Total games\s*1/)
	})
	expect(historyStats).toHaveTextContent(/Won\s*1/)
	expect(historyStats).toHaveTextContent(/Failed\s*0/)
	expect(historyStats).toHaveTextContent(/Accuracy\s*100%/)
	expect(within(drawer).queryByRole("button", { name: "Load more" })).not.toBeInTheDocument()

	const recentHistoryRequests = global.fetch.mock.calls.filter(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/users/1/game-history`),
	)
	const recentHistoryParams = new URL(
		String(recentHistoryRequests[recentHistoryRequests.length - 1][0]),
		"http://localhost",
	).searchParams
	expect(recentHistoryParams.get("limit")).toBe("10")
	expect(recentHistoryParams.get("offset")).toBe("0")

	fireEvent.click(within(drawer).getByRole("button", { name: "all" }))
	await waitFor(() => {
		expect(historyStats).toHaveTextContent(/Total games\s*2/)
	})
	await waitFor(() => {
		expect(within(drawer).getByRole("button", { name: "Load more" })).toBeInTheDocument()
	})

	fireEvent.click(within(drawer).getByRole("button", { name: "Load more" }))
	await waitFor(() => {
		expect(within(drawer).getByText("I drink tea.")).toBeInTheDocument()
	})
	expect(within(drawer).getAllByText("Failed").length).toBeGreaterThan(0)

	const historyRequests = global.fetch.mock.calls.filter(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/users/1/game-history`),
	)
	const secondHistoryParams = new URL(String(historyRequests[3][0]), "http://localhost")
		.searchParams
	expect(secondHistoryParams.get("offset")).toBe("50")

	fireEvent.click(within(drawer).getByRole("tab", { name: "medium" }))
	await waitFor(() => {
		expect(within(drawer).getByText("I write a letter.")).toBeInTheDocument()
	})
	expect(within(drawer).getByRole("tab", { name: "medium" })).toHaveAttribute(
		"aria-selected",
		"true",
	)
	expect(within(drawer).getByText("medium difficulty")).toBeInTheDocument()
	expect(within(drawer).getByText("Nice.")).toBeInTheDocument()

	const updatedHistoryRequests = global.fetch.mock.calls.filter(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/users/1/game-history`),
	)
	const difficultySwitchParams = new URL(String(updatedHistoryRequests[4][0]), "http://localhost")
		.searchParams
	expect(difficultySwitchParams.get("mode")).toBe("translate")
	expect(difficultySwitchParams.get("difficulty")).toBe("medium")
	expect(difficultySwitchParams.get("offset")).toBe("0")

	fireEvent.mouseDown(drawer.parentElement)
	expect(screen.getByLabelText("Translate history drawer")).toBeInTheDocument()

	fireEvent.click(within(drawer).getByRole("button", { name: "Close" }))
	expect(document.querySelector(".statsPage")).not.toHaveClass("statsPageHistoryOpen")
	await waitFor(() => {
		expect(screen.queryByLabelText("Translate history drawer")).not.toBeInTheDocument()
	})
})

test("opens game history from the sentence builder prompt panel", async () => {
	render(<App />)

	expect(screen.queryByRole("button", { name: "History" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})
	expect(screen.queryByRole("button", { name: "History" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})

	const historyButton = screen.getByRole("button", { name: "History" })
	expect(historyButton).toHaveAttribute("aria-pressed", "false")
	expect(historyButton).not.toHaveClass("gamePromptHistoryButtonSelected")

	fireEvent.click(historyButton)

	const drawer = await screen.findByLabelText("Translate history drawer")
	expect(historyButton).toHaveAttribute("aria-pressed", "true")
	expect(historyButton).toHaveClass("gamePromptHistoryButtonSelected")
	expect(within(drawer).getByRole("heading", { name: "Translate history" })).toBeInTheDocument()
	expect(within(drawer).getByText("all difficulty")).toBeInTheDocument()
	expect(within(drawer).getByRole("tab", { name: "all" })).toHaveAttribute("aria-selected", "true")
	const historyStats = within(drawer).getByRole("group", {
		name: "Translate history stats",
	})
	await waitFor(() => {
		expect(historyStats).toHaveTextContent(/Total games\s*3/)
	})
	expect(historyStats).toHaveTextContent(/Won\s*2/)
	expect(historyStats).toHaveTextContent(/Failed\s*1/)
	expect(historyStats).toHaveTextContent(/Accuracy\s*67%/)
	await waitFor(() => {
		expect(within(drawer).getByText("I eat rice.")).toBeInTheDocument()
	})
	expect(within(drawer).getByText("ご飯を食べます。")).toBeInTheDocument()
	expect(within(drawer).getByText("Good.")).toBeInTheDocument()

	const historyRequest = global.fetch.mock.calls.find(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/users/1/game-history`),
	)
	const historyParams = new URL(String(historyRequest[0]), "http://localhost").searchParams
	expect(historyParams.get("mode")).toBe("translate")
	expect(historyParams.get("difficulty")).toBe("all")
	expect(historyParams.get("offset")).toBe("0")

	fireEvent.click(historyButton)
	expect(historyButton).toHaveAttribute("aria-pressed", "false")
	await waitFor(() => {
		expect(screen.queryByLabelText("Translate history drawer")).not.toBeInTheDocument()
	})

	fireEvent.click(historyButton)
	await screen.findByLabelText("Translate history drawer")
	fireEvent.click(screen.getByRole("tab", { name: "conjugations" }))
	await waitFor(() => {
		expect(screen.queryByLabelText("Translate history drawer")).not.toBeInTheDocument()
	})
})

test("shows zero-backgrounded stats panels when stats have not been created yet", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/stats`) {
			return Promise.resolve({
				ok: false,
				status: 404,
				json: jest.fn().mockResolvedValue({
					error: {
						message: "Stats not found.",
					},
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/users/1/game-history`)) {
			return Promise.resolve({
				ok: false,
				status: 404,
				json: jest.fn().mockResolvedValue({
					error: {
						message: "History not found.",
					},
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("link", { name: "Stats" }))

	const allGamesPanel = screen.getByLabelText("All games stats")
	expect(within(allGamesPanel).getAllByText("0")).toHaveLength(3)
	expect(within(allGamesPanel).getByText("0%")).toBeInTheDocument()
	expect(screen.getByLabelText("Translate stats")).toHaveTextContent("0%")
	expect(screen.getByLabelText("Conjugations stats")).toHaveTextContent("0%")
	expect(screen.getByLabelText("Fix sentence stats")).toHaveTextContent("0%")
	expect(screen.getByLabelText("Particles stats")).toHaveTextContent("0%")
	expect(screen.getByLabelText("Reorder stats")).toHaveTextContent("0%")

	await waitFor(() => {
		const statsRequest = global.fetch.mock.calls.find(
			([url]) => url === `${API_BASE_URL}/users/1/stats`,
		)
		expect(statsRequest).toBeTruthy()
	})
	expect(screen.queryByText("Stats not found.")).not.toBeInTheDocument()
})

test("shows locally recorded stats when backend stats are unavailable", async () => {
	const challengeId = "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95"

	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
					},
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: "I eat rice.",
					difficulty: "easy",
					challengeId,
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: true,
					feedback: "Good.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/stats`) {
			return Promise.resolve({
				ok: false,
				status: 404,
				json: jest.fn().mockResolvedValue({
					error: {
						message: "Stats not found.",
					},
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})
	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))
	fireEvent.click(screen.getByRole("button", { name: "Check" }))
	await waitFor(() => {
		expect(screen.getByText("Correct. Good.")).toBeInTheDocument()
	})
	fireEvent.click(screen.getByRole("button", { name: "Check" }))
	await waitFor(() => {
		const checkRequests = global.fetch.mock.calls.filter(
			([url]) => url === `${API_BASE_URL}/games/check`,
		)
		expect(checkRequests).toHaveLength(2)
	})

	fireEvent.click(screen.getByRole("link", { name: "Stats" }))

	const allGamesPanel = screen.getByLabelText("All games stats")
	expect(within(allGamesPanel).getAllByText("1")).toHaveLength(2)
	expect(within(allGamesPanel).getByText("100%")).toBeInTheDocument()
	expect(screen.getByLabelText("Translate stats")).toHaveTextContent("100%")
	expect(screen.getByLabelText("Conjugations stats")).toHaveTextContent("0%")

	fireEvent.click(screen.getByRole("tab", { name: "easy" }))
	expect(allGamesPanel).toHaveTextContent(/Total games\s*1/)
	expect(allGamesPanel).toHaveTextContent(/Accuracy\s*100%/)

	fireEvent.click(screen.getByRole("tab", { name: "medium" }))
	expect(allGamesPanel).toHaveTextContent(/Total games\s*0/)
	expect(allGamesPanel).toHaveTextContent(/Accuracy\s*0%/)

	fireEvent.click(screen.getByRole("tab", { name: "easy" }))
	fireEvent.click(
		within(screen.getByLabelText("Translate stats")).getByRole("button", {
			name: "History",
		}),
	)
	const drawer = await screen.findByLabelText("Translate history drawer")
	const historyStats = within(drawer).getByRole("group", {
		name: "Translate history stats",
	})
	expect(historyStats).toHaveTextContent(/Total games\s*1/)
	expect(historyStats).toHaveTextContent(/Accuracy\s*100%/)
	expect(within(drawer).getByText("I eat rice.")).toBeInTheDocument()
	expect(within(drawer).getByText("。")).toBeInTheDocument()
	expect(within(drawer).getByText("Good.")).toBeInTheDocument()
	expect(within(drawer).getAllByText("I eat rice.")).toHaveLength(1)

	await waitFor(() => {
		const statsRequest = global.fetch.mock.calls.find(
			([url]) => url === `${API_BASE_URL}/users/1/stats`,
		)
		expect(statsRequest).toBeTruthy()
	})
})

test("redirects logged-out users away from stats", async () => {
	window.history.pushState({}, "", "/stats")

	render(<App />)

	await waitFor(() => {
		expect(window.location.pathname).toBe("/login")
	})
	expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
})

test("clears stale login state when stats auth has expired", async () => {
	window.history.pushState({}, "", "/stats")
	window.localStorage.setItem(
		"jsbCurrentUser",
		JSON.stringify({
			id: 1,
			email: "tyler@example.com",
			displayName: "Tyler",
		}),
	)
	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/users/1/stats`) {
			return Promise.resolve({
				ok: false,
				status: 401,
				json: jest.fn().mockResolvedValue({
					error: {
						code: "AUTHENTICATION_REQUIRED",
						message: "Login is required.",
					},
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({}),
		})
	})

	render(<App />)

	await waitFor(() => {
		expect(window.location.pathname).toBe("/login")
	})
	expect(window.localStorage.getItem("jsbCurrentUser")).toBeNull()
	expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
	expect(screen.queryByText("Login is required.")).not.toBeInTheDocument()
})

test("renders the login page at the login route", () => {
	window.history.pushState({}, "", "/login")

	render(<App />)

	expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	expect(screen.getByLabelText("Password")).toBeInTheDocument()
})

test("switches game tabs and clears the sentence", async () => {
	jest.spyOn(Math, "random").mockReturnValue(0)

	render(<App />)

	const gameTabs = [
		"sandbox",
		"shuffle",
		"translate",
		"conjugations",
		"fix sentence",
		"particles",
		"reorder",
	]
	gameTabs.forEach((gameTab) => {
		expect(screen.getByRole("tab", { name: gameTab })).toBeInTheDocument()
	})
	expect(screen.getByRole("tab", { name: "sandbox" })).toHaveAttribute("aria-selected", "true")
	expect(screen.getByRole("heading", { name: "Sandbox" })).toBeInTheDocument()
	expect(screen.getByText("Create any sentence you want.")).toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))
	expect(screen.getAllByText("。").length).toBeGreaterThan(0)
	await waitFor(() => {
		expect(screen.getByText(".")).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("tab", { name: "shuffle" }))

	expect(screen.getByRole("tab", { name: "sandbox" })).toHaveAttribute("aria-selected", "false")
	expect(screen.getByRole("tab", { name: "shuffle" })).toHaveAttribute("aria-selected", "true")
	expect(screen.queryByText("。")).not.toBeInTheDocument()
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})
	expect(screen.getByRole("heading", { name: "Translate sentence practice" })).toBeInTheDocument()
	expect(screen.getByText("Translate the English sentence into Japanese.")).toBeInTheDocument()
})

test("shows the free challenge limit intro once without persistent quota text", async () => {
	render(<App />)

	await loginDefaultUser()

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})

	const introDialog = await screen.findByRole("dialog", {
		name: "Free challenge checks",
	})
	expect(introDialog).toHaveTextContent("Free accounts get 3 challenge checks per day.")
	expect(screen.queryByText(/free checks left today/)).not.toBeInTheDocument()

	fireEvent.click(within(introDialog).getByRole("button", { name: "Okay" }))
	expect(window.localStorage.getItem("bbFreeGameLimitIntroDismissed:1")).toBe("true")
	await waitFor(() => {
		expect(screen.queryByRole("dialog", { name: "Free challenge checks" })).not.toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("tab", { name: "sandbox" }))
	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})
	expect(screen.queryByRole("dialog", { name: "Free challenge checks" })).not.toBeInTheDocument()
})

test("shows a persistent buy premium blocker when free quota is exhausted", async () => {
	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
						plan: "free",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					plan: "free",
					limit: 3,
					used: 3,
					remaining: 0,
					resetsAt: "2026-05-29T00:00:00.000Z",
					canPlay: false,
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			const mode = new URL(String(url), "http://localhost").searchParams.get("mode")
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode,
					difficulty: "easy",
					prompt: "I eat rice.",
					challengeId: firstChallengeId,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	await loginDefaultUser()

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})
	expect(screen.queryByRole("dialog", { name: "Free challenge checks" })).not.toBeInTheDocument()
	expect(screen.getByText("You've used today's 3 free challenge checks.")).toBeInTheDocument()
	expect(screen.getByText("Buy premium for unlimited practice.")).toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument()

	let quotaBlocker = screen
		.getByText("You've used today's 3 free challenge checks.")
		.closest(".gameQuotaBlocker")
	const buyLink = within(quotaBlocker).getByRole("link", { name: "Buy premium" })
	expect(buyLink).toHaveAttribute("href", "/buy")

	fireEvent.click(screen.getByRole("tab", { name: "particles" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})
	expect(screen.getByText("You've used today's 3 free challenge checks.")).toBeInTheDocument()

	quotaBlocker = screen
		.getByText("You've used today's 3 free challenge checks.")
		.closest(".gameQuotaBlocker")
	fireEvent.click(within(quotaBlocker).getByRole("link", { name: "Buy premium" }))
	expect(window.location.pathname).toBe("/buy")
})

test("shows the buy premium blocker instead of a prompt error when prompt loading is quota-blocked", async () => {
	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
						plan: "free",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					plan: "free",
					limit: 3,
					used: 2,
					remaining: 1,
					resetsAt: "2026-05-29T00:00:00.000Z",
					canPlay: true,
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: false,
				status: 403,
				json: jest.fn().mockResolvedValue({
					error: {
						code: "DAILY_GAME_LIMIT_REACHED",
						message: "You've used today's 3 free challenge checks.",
						details: {
							quota: {
								plan: "free",
								limit: 3,
								used: 3,
								remaining: 0,
								resetsAt: "2026-05-29T00:00:00.000Z",
								canPlay: false,
							},
						},
					},
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	await loginDefaultUser()
	window.localStorage.setItem("bbFreeGameLimitIntroDismissed:1", "true")

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))

	await waitFor(() => {
		expect(screen.getByText("You've used today's 3 free challenge checks.")).toBeInTheDocument()
	})
	expect(screen.getByText("Buy premium for unlimited practice.")).toBeInTheDocument()
	expect(screen.queryByText("Could not load a prompt.")).not.toBeInTheDocument()
})

test("shows the buy premium blocker immediately when logged-in quota loading is rejected", async () => {
	window.localStorage.setItem(
		"jsbCurrentUser",
		JSON.stringify({
			id: 1,
			email: "tyler@example.com",
			displayName: "Tyler",
			plan: "free",
		}),
	)

	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: false,
				status: 401,
				json: jest.fn().mockResolvedValue({
					error: {
						code: "AUTHENTICATION_REQUIRED",
						message: "Login is required.",
					},
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "translate",
					difficulty: "easy",
					prompt: "I eat rice.",
					challengeId: firstChallengeId,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))

	await waitFor(() => {
		expect(screen.getByText("You've used today's 3 free challenge checks.")).toBeInTheDocument()
	})
	expect(screen.getByText("Buy premium for unlimited practice.")).toBeInTheDocument()
	await waitFor(() => {
		expect(screen.queryByRole("dialog", { name: "Free challenge checks" })).not.toBeInTheDocument()
	})
	expect(screen.queryByText("Log in to check challenge answers.")).not.toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument()
})

test("shows the buy premium blocker when a logged-in challenge check is quota-gated", async () => {
	window.localStorage.setItem(
		"jsbCurrentUser",
		JSON.stringify({
			id: 1,
			email: "tyler@example.com",
			displayName: "Tyler",
			plan: "free",
		}),
	)

	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					plan: "free",
					limit: 3,
					used: 0,
					remaining: 3,
					resetsAt: "2026-05-29T00:00:00.000Z",
					canPlay: true,
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "translate",
					difficulty: "easy",
					prompt: "I eat rice.",
					challengeId: firstChallengeId,
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: false,
				status: 401,
				json: jest.fn().mockResolvedValue({
					error: {
						code: "LOGIN_REQUIRED_FOR_CHALLENGE_CHECKS",
						message: "Log in to check challenge answers.",
					},
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})
	const introDialog = await screen.findByRole("dialog", {
		name: "Free challenge checks",
	})
	fireEvent.click(within(introDialog).getByRole("button", { name: "Okay" }))

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))
	fireEvent.click(screen.getByRole("button", { name: "Check" }))

	const blocker = await screen
		.findByText("You've used today's 3 free challenge checks.")
		.then((element) => element.closest(".gameQuotaBlocker"))
	expect(blocker).toBeInTheDocument()
	expect(within(blocker).getByText("Buy premium for unlimited practice.")).toBeInTheDocument()
	expect(within(blocker).getByRole("link", { name: "Buy premium" })).toHaveAttribute("href", "/buy")
	expect(
		screen.queryByText("Not quite. Log in to check challenge answers."),
	).not.toBeInTheDocument()
	expect(screen.queryByText("Log in to check challenge answers.")).not.toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument()
})

test("blocks after three local fallback challenge checks with stale backend quota", async () => {
	let promptIndex = 0

	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
						plan: "free",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					plan: "free",
					limit: 15,
					used: 0,
					remaining: 15,
					resetsAt: "2026-05-29T00:00:00.000Z",
					canPlay: true,
				}),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			const promptNumber = promptIndex + 1
			promptIndex += 1

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "translate",
					difficulty: "easy",
					prompt: `Prompt ${promptNumber}.`,
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: true,
					feedback: "Good.",
					quota: {
						plan: "free",
						limit: 15,
						used: 1,
						remaining: 14,
						resetsAt: "2026-05-29T00:00:00.000Z",
						canPlay: true,
					},
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	await loginDefaultUser()

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))
	await waitFor(() => {
		expect(screen.getByText("Prompt 1.")).toBeInTheDocument()
	})
	const introDialog = await screen.findByRole("dialog", {
		name: "Free challenge checks",
	})
	fireEvent.click(within(introDialog).getByRole("button", { name: "Okay" }))

	for (let promptNumber = 1; promptNumber <= 3; promptNumber += 1) {
		await waitFor(() => {
			expect(screen.getByText(`Prompt ${promptNumber}.`)).toBeInTheDocument()
		})
		fireEvent.click(screen.getByRole("button", { name: "+ word" }))
		fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
		fireEvent.click(screen.getByRole("button", { name: "。" }))
		fireEvent.click(screen.getByRole("button", { name: "Check" }))

		await waitFor(() => {
			expect(screen.getByText("Correct. Good.")).toBeInTheDocument()
		})

		if (promptNumber < 3) {
			fireEvent.click(screen.getByRole("button", { name: "Next" }))
		}
	}

	expect(screen.getByText("You've used today's 3 free challenge checks.")).toBeInTheDocument()
	expect(screen.getByText("Buy premium for unlimited practice.")).toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument()
})

test("clears all sentence elements", async () => {
	render(<App />)

	const clearAllButton = screen.getByText("Clear all")
	expect(clearAllButton).toBeDisabled()
	expect(clearAllButton).not.toHaveClass("clearAllButtonVisible")

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))

	await waitFor(() => {
		expect(screen.getByText(".")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(clearAllButton).toHaveClass("clearAllButtonVisible")
	})
	expect(clearAllButton).toBeEnabled()
	expect(screen.getAllByText("。").length).toBeGreaterThan(0)

	fireEvent.click(clearAllButton)

	expect(clearAllButton).toBeDisabled()
	expect(clearAllButton).not.toHaveClass("clearAllButtonVisible")
	expect(screen.queryByText("。")).not.toBeInTheDocument()
})

test("checks the sandbox sentence and shows feedback", async () => {
	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/games/sandbox/check-japanese`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: false,
					feedback: "Add a subject and predicate.",
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	expect(screen.queryByRole("button", { name: "Check" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))

	fireEvent.click(screen.getByRole("button", { name: "Check" }))

	await waitFor(() => {
		expect(screen.getByText("Not quite. Add a subject and predicate.")).toBeInTheDocument()
	})

	const sandboxCheckRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/games/sandbox/check-japanese`,
	)
	expect(JSON.parse(sandboxCheckRequest[1].body)).toEqual({
		answer: "。",
	})
	expect(global.fetch.mock.calls.some(([url]) => url === `${API_BASE_URL}/games/check`)).toBe(false)
	expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()
})

test("populates conjugation game elements from Japanese translation prompt data", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		const requestUrl = String(url)
		if (requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "conjugations",
					difficulty: "easy",
					prompt: "I want to eat sushi.",
					englishSentence: "I want to eat sushi.",
					japaneseTranslation: [
						{ kanji: "私", kana: "わたし", particle: "は" },
						{ kanji: "寿司", kana: "すし", particle: "を" },
						{ kanji: "食べる", kana: "たべる" },
					],
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "conjugations" }))

	await waitFor(() => {
		expect(screen.getByText("I want to eat sushi.")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(screen.getAllByText("私").length).toBeGreaterThan(0)
	})
	expect(screen.getAllByText("わたし").length).toBeGreaterThan(0)
	expect(screen.getAllByText("は").length).toBeGreaterThan(0)
	expect(screen.getAllByText("寿司").length).toBeGreaterThan(0)
	expect(screen.getAllByText("すし").length).toBeGreaterThan(0)
	expect(screen.getAllByText("を").length).toBeGreaterThan(0)
	expect(screen.getAllByText("食べ").length).toBeGreaterThan(0)
	expect(screen.getAllByText("たべ").length).toBeGreaterThan(0)
	expect(screen.getAllByText("る").length).toBeGreaterThan(0)
	expectLoggedOutChallengeBlocker()
})

test("does not restore generated elements when switching to translate or sandbox", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		const requestUrl = String(url)
		if (requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) {
			const mode = new URL(requestUrl, "http://localhost").searchParams.get("mode")
			const promptData =
				mode === "conjugations"
					? {
							mode: "conjugations",
							difficulty: "easy",
							prompt: "I want to eat sushi.",
							japaneseTranslation: [
								{ kanji: "私", kana: "わたし", particle: "は" },
								{ kanji: "寿司", kana: "すし", particle: "を" },
								{ kanji: "食べる", kana: "たべる" },
							],
						}
					: {
							mode,
							difficulty: "easy",
							prompt: "Translate this sentence.",
						}

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(promptData),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "conjugations" }))

	await waitFor(() => {
		expect(screen.getByText("I want to eat sushi.")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(screen.getAllByText("私").length).toBeGreaterThan(0)
	})

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))

	await waitFor(() => {
		expect(screen.getByText("Translate this sentence.")).toBeInTheDocument()
	})
	expect(screen.queryAllByText("私")).toHaveLength(0)
	expect(screen.queryAllByText("寿司")).toHaveLength(0)

	fireEvent.click(screen.getByRole("tab", { name: "conjugations" }))

	await waitFor(() => {
		expect(screen.getByText("I want to eat sushi.")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(screen.getAllByText("私").length).toBeGreaterThan(0)
	})

	fireEvent.click(screen.getByRole("tab", { name: "sandbox" }))

	await waitFor(() => {
		expect(screen.getByRole("heading", { name: "Sandbox" })).toBeInTheDocument()
	})
	expect(screen.queryAllByText("私")).toHaveLength(0)
	expect(screen.queryAllByText("寿司")).toHaveLength(0)
})

test("populates particle game elements without preselected particles", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		const requestUrl = String(url)
		if (requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "particles",
					difficulty: "easy",
					prompt: "I eat sushi.",
					japaneseTranslation: [
						{ kanji: "私", kana: "わたし" },
						{ kanji: "寿司", kana: "すし" },
						{ kanji: "食べる", kana: "たべる" },
					],
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "particles" }))

	await waitFor(() => {
		expect(screen.getByText("I eat sushi.")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(screen.getAllByText("私").length).toBeGreaterThan(0)
	})
	expect(screen.getAllByText("寿司").length).toBeGreaterThan(0)
	expect(screen.getAllByText("食べ").length).toBeGreaterThan(0)
	expect(screen.queryByText("は")).not.toBeInTheDocument()
	expect(screen.queryByText("を")).not.toBeInTheDocument()
	expectLoggedOutChallengeBlocker()
})

test("populates reorder game elements in the generated scrambled order", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		const requestUrl = String(url)
		if (requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "reorder",
					difficulty: "easy",
					prompt: "She reads a book.",
					japaneseTranslation: [
						{ kanji: "本", kana: "ほん", particle: "を" },
						{ kanji: "読む", kana: "よむ" },
						{ kanji: "彼女", kana: "かのじょ", particle: "は" },
					],
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "reorder" }))

	await waitFor(() => {
		expect(screen.getByText("She reads a book.")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(screen.getAllByText("本").length).toBeGreaterThan(0)
	})
	expect(screen.getAllByText("を").length).toBeGreaterThan(0)
	expect(screen.getAllByText("読").length).toBeGreaterThan(0)
	expect(screen.getAllByText("む").length).toBeGreaterThan(0)
	expect(screen.getAllByText("彼女").length).toBeGreaterThan(0)
	expect(screen.getAllByText("は").length).toBeGreaterThan(0)
	expectLoggedOutChallengeBlocker()
})

test("populates fix sentence game elements with one mistake", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		const requestUrl = String(url)
		if (requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "fix sentence",
					difficulty: "easy",
					prompt: "I eat sushi.",
					japaneseTranslation: [
						{ kanji: "私", kana: "わたし", particle: "は" },
						{ kanji: "寿司", kana: "すし", particle: "に" },
						{ kanji: "食べる", kana: "たべる" },
					],
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "fix sentence" }))

	await waitFor(() => {
		expect(screen.getByText("I eat sushi.")).toBeInTheDocument()
	})
	await waitFor(() => {
		expect(screen.getAllByText("私").length).toBeGreaterThan(0)
	})
	expect(screen.getAllByText("は").length).toBeGreaterThan(0)
	expect(screen.getAllByText("寿司").length).toBeGreaterThan(0)
	expect(screen.getAllByText("に").length).toBeGreaterThan(0)
	expect(screen.getAllByText("食べ").length).toBeGreaterThan(0)
	expect(screen.queryByText("を")).not.toBeInTheDocument()
	expectLoggedOutChallengeBlocker()
})

test("changing translate difficulty regenerates the prompt and clears sentence elements", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		const requestUrl = String(url)
		if (requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) {
			const difficulty = new URL(requestUrl, "http://localhost").searchParams.get("difficulty")

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: `${difficulty} prompt.`,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))

	await waitFor(() => {
		expect(screen.getByText("easy prompt.")).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))
	expect(screen.getAllByText("。").length).toBeGreaterThan(0)

	fireEvent.click(screen.getByRole("button", { name: "medium" }))

	await waitFor(() => {
		expect(screen.getByText("medium prompt.")).toBeInTheDocument()
	})
	expect(screen.queryByText("。")).not.toBeInTheDocument()
	expect(
		global.fetch.mock.calls.some(([url]) => {
			const requestUrl = String(url)
			if (!requestUrl.startsWith(`${API_BASE_URL}/games/prompt`)) return false

			const params = new URL(requestUrl, "http://localhost").searchParams
			return params.get("mode") === "translate" && params.get("difficulty") === "medium"
		}),
	).toBe(true)
})

test("regenerates the translate prompt and clears sentence elements", async () => {
	global.fetch.mockImplementation((url, options = {}) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(defaultQuotaResponse),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			const promptRequestCount = global.fetch.mock.calls.filter(([requestUrl]) =>
				String(requestUrl).startsWith(`${API_BASE_URL}/games/prompt`),
			).length

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: promptRequestCount > 1 ? "I drink tea." : "I eat rice.",
					challengeId: promptRequestCount > 1 ? secondChallengeId : firstChallengeId,
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: false,
					feedback: "Use a full Japanese sentence.",
					quota: defaultQuotaResponse,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	await loginDefaultUser()

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))

	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))
	expect(screen.getAllByText("。").length).toBeGreaterThan(0)

	fireEvent.click(screen.getByRole("button", { name: "Check" }))
	await waitFor(() => {
		expect(screen.getByText("Not quite. Use a full Japanese sentence.")).toBeInTheDocument()
	})
	const checkRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/games/check`,
	)
	expect(JSON.parse(checkRequest[1].body)).toEqual({
		mode: "translate",
		difficulty: "easy",
		prompt: "I eat rice.",
		answer: "。",
		challengeId: firstChallengeId,
	})

	fireEvent.click(screen.getByRole("button", { name: "Next" }))

	await waitFor(() => {
		expect(screen.getByText("I drink tea.")).toBeInTheDocument()
	})
	expect(screen.queryByText("。")).not.toBeInTheDocument()
	const promptRequests = global.fetch.mock.calls.filter(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/games/prompt`),
	)
	expect(promptRequests).toHaveLength(2)
	expect(promptRequests[0][0]).toContain("difficulty=easy")
})

test("sends the same challenge ID for repeated checks on one prompt", async () => {
	const challengeId = "1e5eb8e7-f91a-4c61-8f37-62b1a27ddf95"

	global.fetch.mockImplementation((url) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(defaultQuotaResponse),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: "I eat rice.",
					challengeId,
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: true,
					feedback: "Good.",
					quota: defaultQuotaResponse,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	await loginDefaultUser()

	fireEvent.click(screen.getByRole("tab", { name: "translate" }))

	await waitFor(() => {
		expect(screen.getByText("I eat rice.")).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))

	fireEvent.click(screen.getByRole("button", { name: "Check" }))
	await waitFor(() => {
		expect(screen.getByText("Correct. Good.")).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("button", { name: "Check" }))
	await waitFor(() => {
		const checkRequests = global.fetch.mock.calls.filter(
			([url]) => url === `${API_BASE_URL}/games/check`,
		)
		expect(checkRequests).toHaveLength(2)
	})

	const checkBodies = global.fetch.mock.calls
		.filter(([url]) => url === `${API_BASE_URL}/games/check`)
		.map(([, options]) => JSON.parse(options.body))
	expect(checkBodies).toEqual([
		{
			mode: "translate",
			difficulty: "easy",
			prompt: "I eat rice.",
			answer: "。",
			challengeId,
		},
		{
			mode: "translate",
			difficulty: "easy",
			prompt: "I eat rice.",
			answer: "。",
			challengeId,
		},
	])
})

test("calls prompt and check endpoints with a random real mode for shuffle", async () => {
	jest.spyOn(Math, "random").mockReturnValue(0.6)

	global.fetch.mockImplementation((url, options = {}) => {
		if (url === `${API_BASE_URL}/login`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					user: {
						id: 1,
						email: "tyler@example.com",
						displayName: "Tyler",
					},
				}),
			})
		}

		if (url === `${API_BASE_URL}/users/1/game-quota`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue(defaultQuotaResponse),
			})
		}

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "particles",
					difficulty: "easy",
					prompt: "I eat sushi.",
					challengeId: firstChallengeId,
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: true,
					feedback: "Good.",
					quota: defaultQuotaResponse,
				}),
			})
		}

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

	await loginDefaultUser()

	fireEvent.click(screen.getByRole("tab", { name: "shuffle" }))

	await waitFor(() => {
		expect(screen.getByText("I eat sushi.")).toBeInTheDocument()
	})
	expect(screen.getByRole("heading", { name: "Particle practice" })).toBeInTheDocument()
	expect(screen.getByText("Choose the particle that fits the sentence.")).toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))

	fireEvent.click(screen.getByRole("button", { name: "Check" }))

	await waitFor(() => {
		expect(screen.getByText("Correct. Good.")).toBeInTheDocument()
	})

	const promptRequest = global.fetch.mock.calls.find(([url]) =>
		String(url).startsWith(`${API_BASE_URL}/games/prompt`),
	)
	const promptParams = new URL(String(promptRequest[0]), "http://localhost").searchParams
	expect(promptParams.get("mode")).toBe("particles")

	const checkRequest = global.fetch.mock.calls.find(
		([url]) => url === `${API_BASE_URL}/games/check`,
	)
	expect(JSON.parse(checkRequest[1].body)).toEqual({
		mode: "particles",
		difficulty: "easy",
		prompt: "I eat sushi.",
		answer: "。",
		challengeId: firstChallengeId,
	})
})
