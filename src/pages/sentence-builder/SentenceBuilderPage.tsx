import { useCallback, useEffect, useMemo, useState } from "react"
import type { GamePromptData, User } from "../../api/types"
import { useGameQuota } from "../../useGameQuota"
import GameControls from "./games/GameControls"
import GameModeSelector from "./games/GameModeSelector"
import GamePrompt from "./games/GamePrompt"
import SentenceBuilderWorkspace from "./components/SentenceBuilderWorkspace"
import { japaneseTranslationToElements } from "./grammar/japaneseTranslationElements"
import { GameHistoryDrawer, useGameHistoryDrawer } from "../stats/GameHistoryDrawer"
import "./GameQuota.css"

const PROMPT_ELEMENT_GAME_MODES = new Set(["conjugations", "fix sentence", "particles", "reorder"])
const GAME_HISTORY_LABELS: Record<string, string> = {
	translate: "Translate",
	conjugations: "Conjugate",
	"fix sentence": "Fix mistakes",
	particles: "Particles",
	reorder: "Word order",
}

type PromptStatus = "idle" | "loading" | "ready" | "error"

export default function SentenceBuilderPage({
	currentUser,
	onAuthExpired,
}: {
	currentUser?: User | null
	onAuthExpired?: () => void
}) {
	const [selectedGameMode, setSelectedGameMode] = useState("sandbox")
	const [workspaceResetCount, setWorkspaceResetCount] = useState(0)
	const [sentenceClearRequestCount, setSentenceClearRequestCount] = useState(0)
	const [gamePrompt, setGamePrompt] = useState("")
	const [gamePromptData, setGamePromptData] = useState<GamePromptData | null>(null)
	const [gamePromptStatus, setGamePromptStatus] = useState<PromptStatus>("idle")
	const [japaneseSentence, setJapaneseSentence] = useState("")
	const [hasSentenceElements, setHasSentenceElements] = useState(false)
	const gameHistory = useGameHistoryDrawer(currentUser)
	const gameQuota = useGameQuota(currentUser, { onAuthExpired })
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
	const generatedElementMode = gamePromptData?.mode || null
	const generatedPromptElements = useMemo(() => {
		if (!shouldPopulatePromptElements(selectedGameMode, gamePromptData)) return []

		return japaneseTranslationToElements(gamePromptData.japaneseTranslation)
	}, [gamePromptData, selectedGameMode])
	const hasGeneratedPromptElements = generatedPromptElements.length > 0
	const generatedPromptWorkspacePermissions = getGeneratedPromptWorkspacePermissions({
		generatedElementMode,
		hasGeneratedPromptElements,
	})

	useEffect(() => {
		document.documentElement.classList.add("sentenceBuilderDocument")
		document.body.classList.add("sentenceBuilderBody")

		return () => {
			document.documentElement.classList.remove("sentenceBuilderDocument")
			document.body.classList.remove("sentenceBuilderBody")
		}
	}, [])

	const handleSentenceChange = useCallback(({ sentence, hasElements }: { sentence: string; hasElements: boolean }) => {
		setJapaneseSentence(sentence)
		setHasSentenceElements(hasElements)
	}, [])

	const handlePromptChange = useCallback(({ prompt, status, promptData }: { prompt: string; status: PromptStatus; promptData: GamePromptData | null }) => {
		setGamePrompt(prompt)
		setGamePromptData(promptData || null)
		setGamePromptStatus(status)
	}, [])

	function resetSentence() {
		setWorkspaceResetCount((count) => count + 1)
		setJapaneseSentence("")
		setHasSentenceElements(false)
	}

	function clearSentence() {
		setSentenceClearRequestCount((count) => count + 1)
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

	function selectGameMode(gameMode: string) {
		if (gameMode !== selectedGameMode) {
			gameHistory.closeHistory()
		}
		setSelectedGameMode(gameMode)
		clearGamePrompt()
		resetSentence()
	}

	function togglePromptHistory() {
		if (!historyGameMode) return

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
				onOpenHistory={historyGameMode ? togglePromptHistory : null}
				onRegenerate={regenerateGamePrompt}
				onPromptChange={handlePromptChange}
			/>
			<SentenceBuilderWorkspace
				showTranslation={!isGame}
				resetKey={workspaceResetCount}
				clearKey={sentenceClearRequestCount}
				generatedElements={generatedPromptElements}
				generatedElementMode={generatedElementMode}
				canAddElements={generatedPromptWorkspacePermissions.canAddElements}
				canDragGeneratedElements={
					generatedPromptWorkspacePermissions.canDragGeneratedElements
				}
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
				canClearSentence={hasSentenceElements && !hasGeneratedPromptElements}
				onGameQuotaChange={gameQuota.applyQuota}
				onLocalGameQuotaUse={gameQuota.recordLocalChallengeCheck}
				onAuthExpired={onAuthExpired}
				onClearSentence={clearSentence}
				onNext={regenerateGamePrompt}
			/>
			<GameHistoryDrawer {...gameHistory.drawerProps} />
			{/* TODO(premium): Re-enable this intro modal when free quotas return.
				<div className="freeLimitModalOverlay" role="presentation">
					<section
						className="freeLimitModal"
						role="dialog"
						aria-labelledby="free-limit-title"
						aria-modal="true"
					>
						<h2 id="free-limit-title">Free challenge checks</h2>
						<p>Free accounts get a daily challenge check limit.</p>
						<button
							type="button"
							className="freeLimitModalButton"
							onClick={dismissFreeLimitIntro}
						>
							Okay
						</button>
					</section>
				</div>
			*/}
		</div>
	)
}

function shouldPopulatePromptElements(gameMode: string, promptData?: GamePromptData | null) {
	const generatedGameMode = promptData?.mode
	if (!generatedGameMode) return false
	if (gameMode !== "shuffle" && generatedGameMode !== gameMode) return false
	if (!PROMPT_ELEMENT_GAME_MODES.has(generatedGameMode)) return false

	return Array.isArray(promptData?.japaneseTranslation)
}

export function getGeneratedPromptWorkspacePermissions({
	generatedElementMode,
	hasGeneratedPromptElements,
}: {
	generatedElementMode?: string | null
	hasGeneratedPromptElements: boolean
}) {
	const canFreelyEditGeneratedSentence = generatedElementMode === "fix sentence"

	return {
		canAddElements: !hasGeneratedPromptElements || canFreelyEditGeneratedSentence,
		canDragGeneratedElements:
			generatedElementMode === "reorder" || canFreelyEditGeneratedSentence,
	}
}

function resolveHistoryGameMode(selectedGameMode: string, generatedGameMode?: string | null) {
	if (selectedGameMode === "sandbox") return null
	if (selectedGameMode === "shuffle") return generatedGameMode || null

	return selectedGameMode
}
