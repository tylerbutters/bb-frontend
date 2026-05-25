import { useEffect, useState } from "react"

export default function GamePrompt({
	isVisible,
	gameMode,
	requestKey,
	onRegenerate,
	onPromptChange,
}) {
	const [prompt, setPrompt] = useState("")
	const [status, setStatus] = useState("idle")
	const label = getGamePromptLabel(gameMode)
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
				const nextPrompt = await generateGamePrompt(gameMode)
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
	}, [gameMode, hasPromptGenerator, isVisible, onPromptChange, requestKey])

	if (!isVisible || !hasPromptGenerator) return null

	return (
		<section className="gamePromptPanel" aria-live="polite">
			<div className="gamePromptHeader">
				<div className="gamePromptLabel">{label}</div>
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

function getGamePromptLabel(gameMode) {
	switch (gameMode) {
		case "translate":
			return "English sentence"
		default:
			return "Prompt"
	}
}

async function generateGamePrompt(gameMode) {
	switch (gameMode) {
		case "translate":
			return generateTranslatePrompt()
		default:
			throw new Error(`No prompt generator configured for ${gameMode}.`)
	}
}

async function generateTranslatePrompt() {
	const response = await fetch("/api/v1/games/translate/prompt", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})

	if (!response.ok) {
		throw new Error(`Prompt request failed with ${response.status}.`)
	}

	const data = await response.json()
	return data.sentence || ""
}
