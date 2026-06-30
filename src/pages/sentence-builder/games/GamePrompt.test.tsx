// @ts-nocheck
import { act, render, screen } from "@testing-library/react"
import { generateGamePrompt } from "../../../api/games"
import GamePrompt from "./GamePrompt"

jest.mock("../../../api/games", () => ({
	generateGamePrompt: jest.fn(),
}))

beforeEach(() => {
	generateGamePrompt.mockReset()
})

test("shows a loading spinner instead of loading text while fetching the sentence", async () => {
	let resolvePrompt
	generateGamePrompt.mockReturnValue(
		new Promise((resolve) => {
			resolvePrompt = resolve
		}),
	)

	render(
		<GamePrompt
			isVisible
			gameMode="translate"
			onPromptChange={jest.fn()}
			onRegenerate={jest.fn()}
		/>,
	)

	expect(screen.getByRole("status", { name: "Loading sentence" })).toBeInTheDocument()
	expect(screen.queryByText("Loading...")).not.toBeInTheDocument()

	await act(async () => {
		resolvePrompt({ prompt: "I eat sushi.", mode: "translate", difficulty: "easy" })
	})

	expect(screen.getByText("I eat sushi.")).toBeInTheDocument()
})
