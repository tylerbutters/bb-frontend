import { useCallback, useState } from "react"
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
	const [gamePrompt, setGamePrompt] = useState("")
	const [gamePromptStatus, setGamePromptStatus] = useState("idle")
	const [japaneseSentence, setJapaneseSentence] = useState("")
	const [hasSentenceElements, setHasSentenceElements] = useState(false)
	const isGame = selectedGameMode !== "sandbox"

	const handleSentenceChange = useCallback(({ sentence, hasElements }) => {
		setJapaneseSentence(sentence)
		setHasSentenceElements(hasElements)
	}, [])

	const handlePromptChange = useCallback(({ prompt, status }) => {
		setGamePrompt(prompt)
		setGamePromptStatus(status)
	}, [])

	function resetSentence() {
		setWorkspaceResetCount((count) => count + 1)
		setJapaneseSentence("")
		setHasSentenceElements(false)
	}

	function regenerateGamePrompt() {
		resetSentence()
	}

	function selectGameMode(gameMode) {
		setSelectedGameMode(gameMode)
		resetSentence()
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
				isVisible={isGame}
				gameMode={selectedGameMode}
				requestKey={workspaceResetCount}
				onRegenerate={regenerateGamePrompt}
				onPromptChange={handlePromptChange}
			/>
			<SentenceBuilderWorkspace
				showTranslation={!isGame}
				resetKey={workspaceResetCount}
				onSentenceChange={handleSentenceChange}
			/>
			<GameControls
				isVisible={isGame && hasSentenceElements}
				gameMode={selectedGameMode}
				prompt={gamePrompt}
				promptStatus={gamePromptStatus}
				answer={japaneseSentence}
				onNext={regenerateGamePrompt}
			/>
		</div>
	)
}
