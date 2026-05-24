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
	global.fetch = jest.fn((url) => {
		if (url === "/api/v1/users/") {
			return Promise.resolve({
				ok: true,
				json: jest.fn().mockResolvedValue({ user: { id: 1 } }),
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
	expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/signin")
	expect(window.location.pathname).toBe("/signup")

	fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Tyler" } })
	fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tyler@example.com" } })
	fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password1" } })
	fireEvent.click(screen.getByRole("button", { name: "Create account" }))

	await waitFor(() => {
		expect(screen.getByText("Account created.")).toBeInTheDocument()
	})
	const signupRequest = global.fetch.mock.calls.find(([url]) => url === "/api/v1/users/")
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
})

test("renders the sign up page at the signup route", () => {
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
	expect(window.location.pathname).toBe("/signin")
})

test("renders the sign in page at the sign in route", () => {
	window.history.pushState({}, "", "/signin")

	render(<App />)

	expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
	expect(screen.getByLabelText("Email")).toBeInTheDocument()
	expect(screen.getByLabelText("Password")).toBeInTheDocument()
})

test("switches game tabs and clears the sentence", async () => {
	render(<App />)

	const gameTabs = ["sandbox", "shuffle", "translate", "conjugations", "fix sentence", "particles", "reorder"]
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
	expect(screen.getByText("Build the correct sentence from shuffled Japanese parts.")).toBeInTheDocument()
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
