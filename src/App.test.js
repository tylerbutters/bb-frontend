import { fireEvent, render, screen, waitFor } from "@testing-library/react"
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
	global.fetch = jest.fn((url) => {
		if (url === "/api/v1/users/") {
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

		if (url === "/api/v1/login") {
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

		return Promise.resolve({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "." }),
		})
	})
})

afterEach(() => {
	jest.restoreAllMocks()
})

test("renders the initial add button", () => {
	render(<App />)
	expect(screen.getByRole("button", { name: "+ word" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
})

test("opens the sign up page and creates an account", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Sign up" }))

	expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument()
	expect(screen.getByText(/Already have an account\?/)).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")
	expect(window.location.pathname).toBe("/signup")

	fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Tyler" } })
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Create account" }))

	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Tyler" })).toBeInTheDocument()
	})
	expect(window.location.pathname).toBe("/")
	const loginRequest = global.fetch.mock.calls.find(([url]) => url === "/api/v1/users/")
	expect(loginRequest[1]).toMatchObject({
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	})
	expect(JSON.parse(loginRequest[1].body)).toEqual({
		displayName: "Tyler",
		email: "tyler@example.com",
		password: "password1",
	})
})

test("renders the sign up page at the sign up route", () => {
	window.history.pushState({}, "", "/signup")

	render(<App />)

	expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.getByLabelText("Display name")).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	expect(screen.getByLabelText("Password")).toBeInTheDocument()
})

test("opens the sign in page", () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Sign in" }))

	expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	expect(screen.getByLabelText("Password")).toBeInTheDocument()
	expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup")
	expect(window.location.pathname).toBe("/login")
})

test("logs in and replaces auth links with the user name", async () => {
	render(<App />)

	fireEvent.click(screen.getByRole("link", { name: "Sign in" }))
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Sign in" }))

	await waitFor(() => {
		expect(screen.getByRole("button", { name: "Tyler" })).toBeInTheDocument()
	})
	expect(window.location.pathname).toBe("/")
	expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument()
	expect(screen.queryByRole("link", { name: "Sign up" })).not.toBeInTheDocument()
	expect(screen.queryByRole("menuitem", { name: "Log out" })).not.toBeInTheDocument()

	fireEvent.click(screen.getByRole("button", { name: "Tyler" }))
	expect(screen.getByRole("menuitem", { name: "Log out" })).toBeInTheDocument()

	fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }))
	expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument()
	expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "Tyler" })).not.toBeInTheDocument()
	expect(window.localStorage.getItem("jsbCurrentUser")).toBeNull()

	const loginRequest = global.fetch.mock.calls.find(([url]) => url === "/api/v1/login")
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

test("renders the sign in page at the sign in route", () => {
	window.history.pushState({}, "", "/login")

	render(<App />)

	expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	expect(screen.getByLabelText("Password")).toBeInTheDocument()
})

test("switches game tabs and clears the sentence", async () => {
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
	expect(screen.getByRole("heading", { name: "Shuffle practice" })).toBeInTheDocument()
	expect(
		screen.getByText("Build the correct sentence from shuffled Japanese parts."),
	).toBeInTheDocument()
	expect(screen.queryByText("。")).not.toBeInTheDocument()
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
