import { useEffect, useState } from "react"
import { generateGamePrompt } from "../../../api/games"
import "./GamePrompt.css"
import { History, RotateCcw } from "lucide-react"

const PROMPT_DIFFICULTIES = ["easy", "medium", "hard"]
const SHUFFLE_GAME_MODES = ["translate", "conjugations", "fix sentence", "particles", "reorder"]

export default function GamePrompt({
	isVisible,
	gameMode,
	isQuotaExhausted,
	isHistoryOpen,
	requestKey,
	onGameQuotaChange,
	onOpenHistory,
	onRegenerate,
	onPromptChange,
}) {
	const [prompt, setPrompt] = useState("")
	const [status, setStatus] = useState("idle")
	const [errorCode, setErrorCode] = useState("")
	const [difficulty, setDifficulty] = useState(PROMPT_DIFFICULTIES[0])
	const hasPromptGenerator = hasGamePromptGenerator(gameMode)
	const isQuotaLimitError = false
	/*
	TODO(premium): Re-enable quota-limit prompt suppression when premium is live.
	const isQuotaLimitError =
		errorCode === "DAILY_GAME_LIMIT_REACHED" || Boolean(isQuotaExhausted)
	*/

	useEffect(() => {
		if (!isVisible || !hasPromptGenerator) {
			setPrompt("")
			setStatus("idle")
			setErrorCode("")
			onPromptChange?.({ prompt: "", status: "idle", promptData: null })
			return
		}

		const controller = new AbortController()

		async function loadPrompt() {
			const promptRequestMode = resolvePromptRequestMode(gameMode)
			setStatus("loading")
			setErrorCode("")
			onPromptChange?.({
				prompt: "",
				status: "loading",
				promptData: { mode: promptRequestMode },
			})

			try {
				const nextPromptData = await generateGamePrompt({
					gameMode: promptRequestMode,
					difficulty,
					signal: controller.signal,
				})
				if (controller.signal.aborted) return

				const nextPrompt = nextPromptData?.prompt || ""
				const nextPromptDataWithMode = {
					...nextPromptData,
					mode: nextPromptData?.mode || promptRequestMode,
					difficulty: nextPromptData?.difficulty || difficulty,
				}
				setPrompt(nextPrompt)
				setStatus("ready")
				setErrorCode("")
				onPromptChange?.({
					prompt: nextPrompt,
					status: "ready",
					promptData: nextPromptDataWithMode,
				})
			} catch (error) {
				if (controller.signal.aborted) return
				console.log(error)
				const nextErrorCode = error.data?.error?.code || ""
				/*
				TODO(premium): Re-enable quota updates from prompt-load failures.
				const quota = error.data?.error?.details?.quota
				if (nextErrorCode === "DAILY_GAME_LIMIT_REACHED") {
					onGameQuotaChange?.(
						quota || {
							plan: "free",
							limit: 3,
							used: 3,
							remaining: 0,
							canPlay: false,
						},
					)
				}
				*/

				setPrompt("")
				setStatus("error")
				setErrorCode(nextErrorCode)
				onPromptChange?.({ prompt: "", status: "error", promptData: null })
			}
		}

		loadPrompt()

		return () => {
			controller.abort()
		}
	}, [
		difficulty,
		gameMode,
		hasPromptGenerator,
		isVisible,
		onGameQuotaChange,
		onPromptChange,
		requestKey,
	])

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
				<div style={{ position: "absolute", right: 100 }}>
					{onOpenHistory && (
						<button
							type="button"
							className={`gamePromptHistoryButton ${
								isHistoryOpen ? "gamePromptHistoryButtonSelected" : ""
							}`}
							aria-label="History"
							aria-pressed={isHistoryOpen}
							onClick={onOpenHistory}
						>
							<History size={23} />
						</button>
					)}
					<button
						type="button"
						className="gamePromptHistoryButton"
						aria-label="Regenerate"
						onClick={onRegenerate}
						disabled={status === "loading"}
					>
						<RotateCcw size={23} />
						{/* {status === "loading" ? "Generating..." : "Regenerate"} */}
					</button>
				</div>
			</div>
			<div className="gamePromptText">
				{status === "loading" && "Loading..."}
				{status === "error" && !isQuotaLimitError && "Could not load a prompt."}
				{status === "ready" && prompt}
			</div>
		</section>
	)
}

function hasGamePromptGenerator(gameMode) {
	return Boolean(gameMode && gameMode !== "sandbox")
}

function resolvePromptRequestMode(gameMode) {
	if (gameMode !== "shuffle") return gameMode

	const index = Math.floor(Math.random() * SHUFFLE_GAME_MODES.length)
	return SHUFFLE_GAME_MODES[index]
}
