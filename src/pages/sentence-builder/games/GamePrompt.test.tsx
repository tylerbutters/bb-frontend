import { act, render, screen } from "@testing-library/react"
import { generateGamePrompt } from "../../../api/games"
import type { GamePromptData } from "../../../api/types"
import GamePrompt from "./GamePrompt"

jest.mock("../../../api/games", () => ({
	generateGamePrompt: jest.fn(),
}))

const generateGamePromptMock = generateGamePrompt as jest.MockedFunction<typeof generateGamePrompt>

beforeEach(() => {
	generateGamePromptMock.mockReset()
})

test("shows a loading spinner instead of loading text while fetching the sentence", async () => {
	let resolvePrompt: (prompt: GamePromptData) => void = () => {}
	generateGamePromptMock.mockReturnValue(
		new Promise<GamePromptData>((resolve) => {
			resolvePrompt = (prompt) => resolve(prompt)
		}),
	)

	render(
		<GamePrompt
			isVisible
			gameMode="translate"
			isQuotaExhausted={false}
			isHistoryOpen={false}
			requestKey={0}
			onGameQuotaChange={jest.fn()}
			onOpenHistory={jest.fn()}
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
