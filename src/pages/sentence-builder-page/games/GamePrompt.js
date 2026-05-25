import { useEffect, useState } from "react"

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

		let ignore = false

		async function loadPrompt() {
			setStatus("loading")
			onPromptChange?.({ prompt: "", status: "loading" })

			try {
				const nextPrompt = await generateGamePrompt({ gameMode, difficulty })
				if (ignore) return

				setPrompt(nextPrompt)
				setStatus("ready")
				onPromptChange?.({ prompt: nextPrompt, status: "ready" })
			} catch (error) {
				console.log(error)
				if (ignore) return

				setPrompt("")
				setStatus("error")
				onPromptChange?.({ prompt: "", status: "error" })
			}
		}

		loadPrompt()

		return () => {
			ignore = true
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

async function generateGamePrompt({ gameMode, difficulty }) {
	switch (gameMode) {
		case "translate":
			return generateTranslatePrompt(difficulty)
		default:
			throw new Error(`No prompt generator configured for ${gameMode}.`)
	}
}

async function generateTranslatePrompt(difficulty) {
	const response = await fetch(
		`/games/translate/prompt?difficulty=${encodeURIComponent(difficulty)}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	)

	if (!response.ok) {
		throw new Error(`Prompt request failed with ${response.status}.`)
	}

	const data = await response.json()
	return data.sentence || ""
}
