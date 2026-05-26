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
					message:
						"Confirmation code sent. Check your email to finish creating your account.",
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
					message:
						"Confirmation code sent. Check your email to finish creating your account.",
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

		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: "I eat rice.",
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
	expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
})

test("opens the sign up page, confirms the email code, and creates an account", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Sign up" }))

	expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument()
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
		expect(screen.getByRole("button", { name: "Tyler" })).toBeInTheDocument()
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
	expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument()
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
	fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }))

	expect(screen.getByRole("heading", { name: "Reset Password" })).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toHaveValue("tyler@example.com")

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
		global.fetch.mock.calls.filter(([url]) => url === `${API_BASE_URL}/login/password-reset/request`)

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
		expect(screen.getByRole("button", { name: "Tyler" })).toBeInTheDocument()
	})
	expect(window.location.pathname).toBe("/")
	expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument()
	expect(screen.queryByRole("link", { name: "Sign up" })).not.toBeInTheDocument()
	expect(screen.queryByRole("menuitem", { name: "Log out" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Tyler" }))
	expect(screen.getByRole("menuitem", { name: "Log out" })).toBeInTheDocument()

	fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }))
	expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "Tyler" })).not.toBeInTheDocument()
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
		expect(screen.getByRole("button", { name: "Tyler" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("button", { name: "Tyler" }))
	fireEvent.click(screen.getByRole("menuitem", { name: "Account" }))

	expect(window.location.pathname).toBe("/account")
	expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument()
	expect(screen.getByLabelText("Display name")).toHaveValue("Tyler")
	expect(screen.getByLabelText("Email")).toHaveValue("tyler@example.com")
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
		expect(within(emailSection).getByText("Account updated.")).toBeInTheDocument()
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
	expect(accountRequests).toHaveLength(3)
	expect(accountRequests[0][1]).toMatchObject({
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
	})
	expect(accountRequests.map(([, options]) => JSON.parse(options.body))).toEqual([
		{ displayName: "Taylor" },
		{ email: "taylor@example.com" },
		{ currentPassword: "password1", password: "password2" },
	])
	expect(screen.getByLabelText("Current password")).toHaveValue("")
	expect(screen.getByLabelText("New password")).toHaveValue("")
	expect(screen.getByLabelText("Confirm new password")).toHaveValue("")
	expect(JSON.parse(window.localStorage.getItem("jsbCurrentUser"))).toEqual({
		id: 1,
		email: "taylor@example.com",
		displayName: "Taylor",
	})

	fireEvent.click(screen.getByRole("link", { name: "Back" }))
	expect(screen.getByRole("button", { name: "Taylor" })).toBeInTheDocument()
})

test("deletes an account from the account page", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Login" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Login" }))

	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Tyler" })).toBeInTheDocument()
	})

	fireEvent.click(screen.getByRole("button", { name: "Tyler" }))
	fireEvent.click(screen.getByRole("menuitem", { name: "Account" }))
	fireEvent.click(screen.getByRole("button", { name: "Delete account" }))

	expect(screen.getByRole("button", { name: "Confirm delete" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
	expect(screen.queryByRole("button", { name: "Confirm delete" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Delete account" }))
	fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }))

	await waitFor(() => {
		expect(window.location.pathname).toBe("/")
	})

	const deleteRequest = global.fetch.mock.calls.find(
		([url, options]) => url === `${API_BASE_URL}/users/1` && options.method === "DELETE",
	)
	expect(deleteRequest[1]).toMatchObject({
		method: "DELETE",
	})
	expect(window.localStorage.getItem("jsbCurrentUser")).toBeNull()
	expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
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
	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Check" })).toBeEnabled()
	})
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
	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Check" })).toBeEnabled()
	})
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
	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Check" })).toBeEnabled()
	})
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
	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Check" })).toBeEnabled()
	})
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
		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			const promptRequestCount = global.fetch.mock.calls.filter(([requestUrl]) =>
				String(requestUrl).startsWith(`${API_BASE_URL}/games/prompt`),
			).length

			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					prompt: promptRequestCount > 1 ? "I drink tea." : "I eat rice.",
				}),
			})
		}

		if (url === `${API_BASE_URL}/games/check`) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					correct: false,
					feedback: "Use a full Japanese sentence.",
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

	fireEvent.click(screen.getByRole("button", { name: "+ word" }))
	fireEvent.click(screen.getByRole("button", { name: "Punctuation" }))
	fireEvent.click(screen.getByRole("button", { name: "。" }))
	expect(screen.getAllByText("。").length).toBeGreaterThan(0)

	fireEvent.click(screen.getByRole("button", { name: "Check" }))
	await waitFor(() => {
		expect(screen.getByText("Not quite. Use a full Japanese sentence.")).toBeInTheDocument()
	})
	const checkRequest = global.fetch.mock.calls.find(([url]) => url === `${API_BASE_URL}/games/check`)
	expect(JSON.parse(checkRequest[1].body)).toEqual({
		mode: "translate",
		prompt: "I eat rice.",
		answer: "。",
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

test("calls prompt and check endpoints with a random real mode for shuffle", async () => {
	jest.spyOn(Math, "random").mockReturnValue(0.6)

	global.fetch.mockImplementation((url, options = {}) => {
		if (String(url).startsWith(`${API_BASE_URL}/games/prompt`)) {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({
					mode: "particles",
					difficulty: "easy",
					prompt: "I eat sushi.",
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

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})

	render(<App />)

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

	const checkRequest = global.fetch.mock.calls.find(([url]) => url === `${API_BASE_URL}/games/check`)
	expect(JSON.parse(checkRequest[1].body)).toEqual({
		mode: "particles",
		prompt: "I eat sushi.",
		answer: "。",
	})
})
