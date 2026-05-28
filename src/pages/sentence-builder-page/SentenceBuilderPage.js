import { useCallback, useEffect, useMemo, useState } from "react"
import { useGameQuota } from "../../useGameQuota"
import GameControls from "./games/GameControls"
import GameModeSelector from "./games/GameModeSelector"
import GamePrompt from "./games/GamePrompt"
import SentenceBuilderWorkspace from "./components/SentenceBuilderWorkspace"
import { japaneseTranslationToElements } from "./grammar/japaneseTranslationElements"
import { GameHistoryDrawer, useGameHistoryDrawer } from "../GameHistoryDrawer"
import "./GameQuota.css"

const PROMPT_ELEMENT_GAME_MODES = new Set(["conjugations", "fix sentence", "particles", "reorder"])
const FREE_LIMIT_INTRO_STORAGE_PREFIX = "bbFreeGameLimitIntroDismissed"
const FREE_DAILY_CHALLENGE_LIMIT = 3
const GAME_HISTORY_LABELS = {
	translate: "Translate",
	conjugations: "Conjugations",
	"fix sentence": "Fix sentence",
	particles: "Particles",
	reorder: "Reorder",
}

export default function SentenceBuilderPage({ currentUser }) {
	const [selectedGameMode, setSelectedGameMode] = useState("sandbox")
	const [workspaceResetCount, setWorkspaceResetCount] = useState(0)
	const [gamePrompt, setGamePrompt] = useState("")
	const [gamePromptData, setGamePromptData] = useState(null)
	const [gamePromptStatus, setGamePromptStatus] = useState("idle")
	const [japaneseSentence, setJapaneseSentence] = useState("")
	const [hasSentenceElements, setHasSentenceElements] = useState(false)
	const gameHistory = useGameHistoryDrawer(currentUser)
	const gameQuota = useGameQuota(currentUser)
	const [isFreeLimitIntroVisible, setIsFreeLimitIntroVisible] = useState(false)
	const isGame = selectedGameMode && selectedGameMode !== "sandbox"
	const isFreeQuotaExhausted = Boolean(
		currentUser && gameQuota.quota?.plan !== "premium" && gameQuota.quota?.remaining === 0,
	)
	const historyGameMode = resolveHistoryGameMode(selectedGameMode, gamePromptData?.mode)
	const historyGameLabel = historyGameMode
		? GAME_HISTORY_LABELS[historyGameMode] || historyGameMode
		: ""
	const isPromptHistoryOpen =
		gameHistory.isOpen && gameHistory.drawerProps.filter?.mode === historyGameMode
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

	useEffect(() => {
		if (
			!currentUser ||
			!isGame ||
			gameQuota.status !== "ready" ||
			gameQuota.quota?.plan !== "free" ||
			gameQuota.quota?.remaining === 0
		) {
			setIsFreeLimitIntroVisible(false)
			return
		}

		const storageKey = `${FREE_LIMIT_INTRO_STORAGE_PREFIX}:${currentUser.id}`
		if (window.localStorage.getItem(storageKey)) return

		setIsFreeLimitIntroVisible(true)
	}, [currentUser, gameQuota.quota?.plan, gameQuota.quota?.remaining, gameQuota.status, isGame])

	function resetSentence() {
		setWorkspaceResetCount((count) => count + 1)
		setJapaneseSentence("")
		setHasSentenceElements(false)
	}

	function clearGamePrompt() {
		setGamePrompt("")
		setGamePromptData(null)
		setGamePromptStatus("idle")
	}

	function regenerateGamePrompt() {
		clearGamePrompt()
		resetSentence()
	}

	function selectGameMode(gameMode) {
		if (gameMode !== selectedGameMode) {
			gameHistory.closeHistory()
		}
		setSelectedGameMode(gameMode)
		clearGamePrompt()
		resetSentence()
	}

	function togglePromptHistory() {
		if (!currentUser || !historyGameMode) return

		if (isPromptHistoryOpen) {
			gameHistory.closeHistory()
			return
		}

		gameHistory.openHistory({
			mode: historyGameMode,
			label: historyGameLabel,
			difficulty: "all",
		})
	}

	function dismissFreeLimitIntro() {
		if (currentUser) {
			window.localStorage.setItem(`${FREE_LIMIT_INTRO_STORAGE_PREFIX}:${currentUser.id}`, "true")
		}

		setIsFreeLimitIntroVisible(false)
	}

	return (
		<div className="app">
			<GameModeSelector
				selectedGameMode={selectedGameMode}
				generatedGameMode={gamePromptData?.mode}
				onSelectGameMode={selectGameMode}
			/>
			<GamePrompt
				isVisible={isGame}
				gameMode={selectedGameMode}
				isQuotaExhausted={isFreeQuotaExhausted}
				requestKey={workspaceResetCount}
				isHistoryOpen={isPromptHistoryOpen}
				onGameQuotaChange={gameQuota.applyQuota}
				onOpenHistory={currentUser && historyGameMode ? togglePromptHistory : null}
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
				isVisible={isGame || hasSentenceElements}
				gameMode={gamePromptData?.mode || selectedGameMode}
				challengeId={gamePromptData?.challengeId}
				difficulty={gamePromptData?.difficulty}
				currentUser={currentUser}
				gameQuota={gameQuota.quota}
				prompt={gamePrompt}
				promptStatus={gamePromptStatus}
				answer={japaneseSentence}
				onGameQuotaChange={gameQuota.applyQuota}
				onLocalGameQuotaUse={gameQuota.recordLocalChallengeCheck}
				onNext={regenerateGamePrompt}
			/>
			<GameHistoryDrawer {...gameHistory.drawerProps} />
			{isFreeLimitIntroVisible && (
				<div className="freeLimitModalOverlay" role="presentation">
					<section
						className="freeLimitModal"
						role="dialog"
						aria-labelledby="free-limit-title"
						aria-modal="true"
					>
						<h2 id="free-limit-title">Free challenge checks</h2>
						<p>Free accounts get {FREE_DAILY_CHALLENGE_LIMIT} challenge checks per day.</p>
						<button
							type="button"
							className="freeLimitModalButton"
							onClick={dismissFreeLimitIntro}
						>
							Okay
						</button>
					</section>
				</div>
			)}
		</div>
	)
}

function shouldPopulatePromptElements(gameMode, promptData) {
	const generatedGameMode = promptData?.mode
	if (!generatedGameMode) return false
	if (gameMode !== "shuffle" && generatedGameMode !== gameMode) return false
	if (!PROMPT_ELEMENT_GAME_MODES.has(generatedGameMode)) return false

	return Array.isArray(promptData?.japaneseTranslation)
}

function resolveHistoryGameMode(selectedGameMode, generatedGameMode) {
	if (selectedGameMode === "sandbox") return null
	if (selectedGameMode === "shuffle") return generatedGameMode || null

	return selectedGameMode
}
