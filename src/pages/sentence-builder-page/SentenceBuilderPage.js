import { useCallback, useEffect, useState } from "react"
import AccountMenu from "./components/AccountMenu"
import GameControls from "./components/GameControls"
import GameModeSelector from "./components/GameModeSelector"
import GamePrompt from "./components/GamePrompt"
import SentenceBuilderWorkspace from "./components/SentenceBuilderWorkspace"

const GAME_MODES = [
	{
		id: "sandbox",
		title: "Sandbox",
		description: "Create any sentence you want.",
	},
	{
		id: "shuffle",
		title: "Shuffle practice",
		description: "Build the correct sentence from shuffled Japanese parts.",
	},
	{
		id: "translate",
		title: "Translate sentence practice",
		description: "Translate the English sentence into Japanese.",
	},
	{
		id: "conjugations",
		title: "Conjugation practice",
		description: "Choose the right conjugation for the sentence.",
	},
	{
		id: "fix sentence",
		title: "Fix sentence practice",
		description: "Find and fix the mistake in the Japanese sentence.",
	},
	{
		id: "particles",
		title: "Particle practice",
		description: "Choose the particle that fits the sentence.",
	},
	{
		id: "reorder",
		title: "Reorder practice",
		description: "Put the sentence elements in the correct order.",
	},
]

export default function SentenceBuilderPage({ currentUser, onLogout }) {
	const [selectedGameMode, setSelectedGameMode] = useState(GAME_MODES[0].id)
	const [workspaceResetCount, setWorkspaceResetCount] = useState(0)
	const [translatePrompt, setTranslatePrompt] = useState("")
	const [translatePromptStatus, setTranslatePromptStatus] = useState("idle")
	const [translatePromptRequestCount, setTranslatePromptRequestCount] = useState(0)
	const [translateCheckStatus, setTranslateCheckStatus] = useState("idle")
	const [translateFeedback, setTranslateFeedback] = useState(null)
	const [japaneseSentence, setJapaneseSentence] = useState("")
	const [hasSentenceElements, setHasSentenceElements] = useState(false)
	const isTranslateGame = selectedGameMode === "translate"
	const translateControlFeedback =
		translateFeedback &&
		`${translateFeedback.correct ? "Correct." : "Not quite."}${
			translateFeedback.feedback ? ` ${translateFeedback.feedback}` : ""
		}`

	const handleSentenceChange = useCallback(({ sentence, hasElements }) => {
		setJapaneseSentence(sentence)
		setHasSentenceElements(hasElements)
	}, [])

	useEffect(() => {
		if (!isTranslateGame) return

		let ignore = false

		async function loadTranslatePrompt() {
			setTranslatePromptStatus("loading")
			setTranslateFeedback(null)

			try {
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
				if (ignore) return

				setTranslatePrompt(data.sentence || "")
				setTranslatePromptStatus("ready")
			} catch (error) {
				console.log(error)
				if (ignore) return

				setTranslatePrompt("")
				setTranslatePromptStatus("error")
			}
		}

		loadTranslatePrompt()

		return () => {
			ignore = true
		}
	}, [isTranslateGame, translatePromptRequestCount])

	useEffect(() => {
		setTranslateFeedback(null)
		setTranslateCheckStatus("idle")
	}, [japaneseSentence])

	function resetSentence() {
		setWorkspaceResetCount((count) => count + 1)
		setJapaneseSentence("")
		setHasSentenceElements(false)
	}

	function regenerateTranslatePrompt() {
		resetSentence()
		setTranslatePromptRequestCount((count) => count + 1)
	}

	function selectGameMode(gameMode) {
		setSelectedGameMode(gameMode)
		resetSentence()
	}

	async function checkTranslateAnswer() {
		if (!translatePrompt || !japaneseSentence || translateCheckStatus === "checking") return

		setTranslateCheckStatus("checking")
		setTranslateFeedback(null)

		try {
			const response = await fetch("/api/v1/games/translate/check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					englishSentence: translatePrompt,
					japaneseSentence,
				}),
			})

			if (!response.ok) {
				throw new Error(`Check request failed with ${response.status}.`)
			}

			const data = await response.json()
			setTranslateFeedback({
				correct: Boolean(data.correct),
				feedback: data.feedback || "",
			})
			setTranslateCheckStatus("ready")
		} catch (error) {
			console.log(error)
			setTranslateFeedback({
				correct: false,
				feedback: "Could not check the sentence right now. Try again in a moment.",
			})
			setTranslateCheckStatus("error")
		}
	}

	return (
		<div className="app">
			<AccountMenu currentUser={currentUser} onLogout={onLogout} />
			<GameModeSelector
				gameModes={GAME_MODES}
				selectedGameMode={selectedGameMode}
				onSelectGameMode={selectGameMode}
			/>
			<GamePrompt
				isVisible={isTranslateGame}
				label="English sentence"
				prompt={translatePrompt}
				status={translatePromptStatus}
				onRegenerate={regenerateTranslatePrompt}
			/>
			<SentenceBuilderWorkspace
				showTranslation={!isTranslateGame}
				resetKey={workspaceResetCount}
				onSentenceChange={handleSentenceChange}
			/>
			<GameControls
				isVisible={isTranslateGame && hasSentenceElements}
				feedback={
					translateFeedback && {
						tone: translateFeedback.correct ? "success" : "warning",
						text: translateControlFeedback,
					}
				}
				isChecking={translateCheckStatus === "checking"}
				isCheckDisabled={
					!translatePrompt ||
					!japaneseSentence ||
					translatePromptStatus !== "ready" ||
					translateCheckStatus === "checking"
				}
				onCheck={checkTranslateAnswer}
				showNext={Boolean(translateFeedback)}
				isNextDisabled={translatePromptStatus === "loading"}
				onNext={regenerateTranslatePrompt}
			/>
		</div>
	)
}
