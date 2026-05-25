import { useCallback, useMemo, useState } from "react"
import AccountMenu from "./components/AccountMenu"
import GameControls from "./games/GameControls"
import GameModeSelector from "./games/GameModeSelector"
import GamePrompt from "./games/GamePrompt"
import SentenceBuilderWorkspace from "./components/SentenceBuilderWorkspace"
import { japaneseTranslationToElements } from "./grammar/japaneseTranslationElements"

export default function SentenceBuilderPage({ currentUser, onLogout }) {
	const [selectedGameMode, setSelectedGameMode] = useState("sandbox")
	const [workspaceResetCount, setWorkspaceResetCount] = useState(0)
	const [gamePrompt, setGamePrompt] = useState("")
	const [gamePromptData, setGamePromptData] = useState(null)
	const [gamePromptStatus, setGamePromptStatus] = useState("idle")
	const [japaneseSentence, setJapaneseSentence] = useState("")
	const [hasSentenceElements, setHasSentenceElements] = useState(false)
	const isGame = selectedGameMode && selectedGameMode !== "sandbox"
	const generatedPromptElements = useMemo(() => {
		if (!shouldPopulatePromptElements(selectedGameMode, gamePromptData)) return []

		return japaneseTranslationToElements(gamePromptData.japaneseTranslation)
	}, [gamePromptData, selectedGameMode])

	const handleSentenceChange = useCallback(({ sentence, hasElements }) => {
		setJapaneseSentence(sentence)
		setHasSentenceElements(hasElements)
	}, [])

	const handlePromptChange = useCallback(({ prompt, status, promptData }) => {
		setGamePrompt(prompt)
		setGamePromptData(promptData || null)
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
				selectedGameMode={selectedGameMode}
				generatedGameMode={gamePromptData?.mode}
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
				generatedElements={generatedPromptElements}
				onSentenceChange={handleSentenceChange}
			/>
			<GameControls
				isVisible={isGame && hasSentenceElements}
				gameMode={gamePromptData?.mode || selectedGameMode}
				prompt={gamePrompt}
				promptStatus={gamePromptStatus}
				answer={japaneseSentence}
				onNext={regenerateGamePrompt}
			/>
		</div>
	)
}

function shouldPopulatePromptElements(gameMode, promptData) {
	const generatedGameMode = promptData?.mode || gameMode
	if (!generatedGameMode || generatedGameMode === "sandbox" || generatedGameMode === "translate") {
		return false
	}
	return Array.isArray(promptData?.japaneseTranslation)
}
