import { useEffect, useState } from "react"
import { generateTranslatePrompt } from "../../../api/games"
import "./GamePrompt.css"

const PROMPT_DIFFICULTIES = ["easy", "medium", "hard"]

export default function GamePrompt({
	isVisible,
	gameMode,
	requestKey,
	onRegenerate,
	onPromptChange,
}) {
	const [prompt, setPrompt] = useState("")
	const [status, setStatus] = useState("idle")
	const [difficulty, setDifficulty] = useState(PROMPT_DIFFICULTIES[0])
	const hasPromptGenerator = hasGamePromptGenerator(gameMode)

	useEffect(() => {
		if (!isVisible || !hasPromptGenerator) {
			setPrompt("")
			setStatus("idle")
			onPromptChange?.({ prompt: "", status: "idle" })
			return
		}

		const controller = new AbortController()

		async function loadPrompt() {
			setStatus("loading")
			onPromptChange?.({ prompt: "", status: "loading" })

			try {
				const nextPrompt = await generateGamePrompt({
					gameMode,
					difficulty,
					signal: controller.signal,
				})
				if (controller.signal.aborted) return

				setPrompt(nextPrompt)
				setStatus("ready")
				onPromptChange?.({ prompt: nextPrompt, status: "ready" })
			} catch (error) {
				if (controller.signal.aborted) return
				console.log(error)

				setPrompt("")
				setStatus("error")
				onPromptChange?.({ prompt: "", status: "error" })
			}
		}

		loadPrompt()

		return () => {
			controller.abort()
		}
	}, [difficulty, gameMode, hasPromptGenerator, isVisible, onPromptChange, requestKey])

	function selectDifficulty(nextDifficulty) {
		if (nextDifficulty === difficulty) return
		setDifficulty(nextDifficulty)
		onRegenerate()
	}

	if (!isVisible || !hasPromptGenerator) return null

	return (
		<section className="gamePromptPanel" aria-live="polite">
			<div className="gamePromptHeader">
				<div className="gamePromptDifficulty" aria-label="Prompt difficulty">
					{PROMPT_DIFFICULTIES.map((option) => (
						<button
							key={option}
							type="button"
							className={`gamePromptDifficultyButton ${
								difficulty === option ? "gamePromptDifficultyButtonSelected" : ""
							}`}
							onClick={() => selectDifficulty(option)}
						>
							{option}
						</button>
					))}
				</div>
				<button
					type="button"
					className="gamePromptRegenerateButton"
					onClick={onRegenerate}
					disabled={status === "loading"}
				>
					{status === "loading" ? "Generating..." : "Regenerate"}
				</button>
			</div>
			<div className="gamePromptText">
				{status === "loading" && "Loading..."}
				{status === "error" && "Could not load a prompt."}
				{status === "ready" && prompt}
			</div>
		</section>
	)
}

function hasGamePromptGenerator(gameMode) {
	switch (gameMode) {
		case "translate":
			return true
		default:
			return false
	}
}

async function generateGamePrompt({ gameMode, difficulty, signal }) {
	switch (gameMode) {
		case "translate":
			return generateTranslatePrompt(difficulty, { signal })
		default:
			throw new Error(`No prompt generator configured for ${gameMode}.`)
	}
}
