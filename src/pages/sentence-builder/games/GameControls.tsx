import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { checkGameAnswer, checkSandboxSentence } from "../../../api/games"
import type { GameCheckResult, GameQuota, PromptDifficulty, User } from "../../../api/types"
import { recordLocalGameResult } from "../../../gameStatsStorage"
import "./GameControls.css"

const SHOW_FEEDBACK_BY_DEFAULT_STORAGE_KEY = "bbShowFeedbackByDefault"

function readShowFeedbackByDefault() {
	try {
		return window.localStorage.getItem(SHOW_FEEDBACK_BY_DEFAULT_STORAGE_KEY) !== "false"
	} catch {
		return true
	}
}

type CheckStatus = "idle" | "checking" | "ready" | "error"
type PromptStatus = "idle" | "loading" | "ready" | "error"

interface LocalGameQuotaUse {
	challengeId?: string
	gameMode: string
	difficulty?: PromptDifficulty | string
	prompt: string
	serverQuota: GameQuota | null
}

interface GameControlsProps {
	isVisible: boolean
	gameMode: string
	challengeId?: string
	difficulty?: PromptDifficulty | string
	currentUser?: User | null
	gameQuota?: GameQuota | null
	prompt: string
	promptStatus: PromptStatus
	answer: string
	canClearSentence: boolean
	onGameQuotaChange?: (quota: GameQuota) => void
	onLocalGameQuotaUse?: (challenge: LocalGameQuotaUse) => void
	onAuthExpired?: () => void
	onClearSentence?: () => void
	onNext: () => void
}

interface GameApiError {
	status?: number
	message?: string
	data?: {
		error?: {
			code?: string
			details?: {
				quota?: GameQuota
			}
		}
	}
}

function writeShowFeedbackByDefault(value: boolean) {
	try {
		window.localStorage.setItem(SHOW_FEEDBACK_BY_DEFAULT_STORAGE_KEY, String(value))
	} catch {}
}

export default function GameControls({
	isVisible,
	gameMode,
	challengeId,
	difficulty,
	currentUser,
	gameQuota,
	prompt,
	promptStatus,
	answer,
	canClearSentence,
	onGameQuotaChange,
	onLocalGameQuotaUse,
	onAuthExpired,
	onClearSentence,
	onNext,
}: GameControlsProps) {
	const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle")
	const [feedback, setFeedback] = useState<GameCheckResult | null>(null)
	const [showFeedbackByDefault, setShowFeedbackByDefault] = useState(readShowFeedbackByDefault)
	const showFeedbackByDefaultRef = useRef(showFeedbackByDefault)
	const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(showFeedbackByDefault)
	const hasAnswerChecker = hasGameAnswerChecker(gameMode)
	const isSandboxCheck = gameMode === "sandbox"
	const isChecking = checkStatus === "checking"
	const isChallengeCheck = hasAnswerChecker && !isSandboxCheck
	const requiresLogin = isChallengeCheck && !currentUser
	const isLoggedOutSandboxCheck = false
	const isFreeQuota =
		isChallengeCheck && !requiresLogin && currentUser && gameQuota?.plan !== "premium"
	const isQuotaExhausted = Boolean(!requiresLogin && isFreeQuota && gameQuota?.remaining === 0)
	const isCheckDisabled =
		!answer ||
		isChecking ||
		(!isSandboxCheck && (!prompt || promptStatus !== "ready")) ||
		requiresLogin ||
		isLoggedOutSandboxCheck ||
		isQuotaExhausted

	useEffect(() => {
		showFeedbackByDefaultRef.current = showFeedbackByDefault
	}, [showFeedbackByDefault])

	useEffect(() => {
		setFeedback(null)
		setIsFeedbackExpanded(showFeedbackByDefaultRef.current)
		setCheckStatus("idle")
	}, [answer, challengeId, difficulty, gameMode, isVisible, prompt])

	function toggleShowFeedbackByDefault() {
		setShowFeedbackByDefault((currentValue) => {
			const nextValue = !currentValue
			writeShowFeedbackByDefault(nextValue)
			return nextValue
		})
	}

	async function checkAnswer() {
		if (isCheckDisabled) return

		setCheckStatus("checking")
		setFeedback(null)
		setIsFeedbackExpanded(showFeedbackByDefault)

		const checkPayload = { gameMode, difficulty, prompt, answer, challengeId }

		try {
			const nextFeedback = isSandboxCheck
				? await checkSandboxSentence({ answer })
				: await checkGameAnswer(checkPayload)
			if (nextFeedback.quota) onGameQuotaChange?.(nextFeedback.quota)
			if (!isSandboxCheck) {
				onLocalGameQuotaUse?.({
					challengeId,
					gameMode,
					difficulty,
					prompt,
					serverQuota: nextFeedback.quota,
				})
			}
			if (!isSandboxCheck) {
				recordLocalGameResult(currentUser?.id, {
					challengeId,
					mode: gameMode,
					difficulty,
					prompt,
					answer,
					correct: nextFeedback.correct,
					feedback: nextFeedback.feedback,
				})
			}
			setFeedback(nextFeedback)
			setIsFeedbackExpanded(showFeedbackByDefault)
			setCheckStatus("ready")
		} catch (error) {
			const apiError = getGameApiError(error)
			if (isAuthenticationRequiredError(apiError) && onAuthExpired) {
				onAuthExpired?.()
				setCheckStatus("idle")
				return
			}

			const quota = apiError.data?.error?.details?.quota
			if (quota) onGameQuotaChange?.(quota)

			const errorCode = apiError.data?.error?.code
			if (errorCode === "DAILY_GAME_LIMIT_REACHED") {
				if (quota) {
					setFeedback(null)
					setCheckStatus("idle")
					return
				}
			}

			const errorFeedback = gameCheckErrorFeedback(apiError)
			setFeedback({
				correct: false,
				feedback: errorFeedback,
				quota: null,
			})
			setIsFeedbackExpanded(showFeedbackByDefault)
			setCheckStatus("error")
		}
	}

	if (!isVisible || !hasAnswerChecker) return null

	const showAnswerButtons = !requiresLogin && !isLoggedOutSandboxCheck && !isQuotaExhausted
	const showClearButton = Boolean(onClearSentence && canClearSentence)
	const hasFeedbackDetails = Boolean(feedback && !feedback.correct && feedback.feedback)
	const canToggleFeedback = Boolean(
		!isSandboxCheck && feedback && !feedback.correct && hasFeedbackDetails,
	)
	const showFeedbackDetails = canToggleFeedback && isFeedbackExpanded

	return (
		<div className="gameControls">
			{requiresLogin && (
				<div className="gameQuotaBlocker" role="status">
					<p>Sign up to check challenge answers.</p>
					<Link className="gameQuotaButton" to="/signup">
						Sign up
					</Link>
				</div>
			)}
			{isQuotaExhausted && (
				<div className="gameQuotaBlocker" role="status">
					<p>You're out of challenge checks for today.</p>
					<p>Come back tomorrow for more challenge practice.</p>
				</div>
			)}
			{isChecking && (
				<div className="gameCheckingFeedback" role="status" aria-label="Checking answer">
					<span className="gameCheckingSpinner" aria-hidden="true" />
				</div>
			)}
			{feedback &&
				!isChecking &&
				(isSandboxCheck ? (
					<div className="gameFeedback gameFeedbackWarning" role="status">
						{feedback.feedback}
					</div>
				) : (
					<div className="gameFeedbackResult">
						{showFeedbackDetails && (
							<div
								className="gameFeedback gameFeedbackWarning"
								id="game-feedback-details"
								role="status"
							>
								{feedback.feedback}
							</div>
						)}
						{canToggleFeedback && (
							<button
								type="button"
								className="gameFeedbackToggle"
								aria-controls="game-feedback-details"
								aria-expanded={isFeedbackExpanded}
								onClick={() => setIsFeedbackExpanded((isExpanded) => !isExpanded)}
							>
								{isFeedbackExpanded ? "Hide feedback" : "Show feedback"}
							</button>
						)}
						<div
							className="statusText"
							style={{
								color: feedback.correct ? "var(--color-green-text)" : "var(--color-red-text)",
							}}
						>
							{feedback.correct ? "Correct." : "Not quite."}
						</div>
					</div>
				))}

			<div className="buttonsContainer">
				{showClearButton && (
					<button type="button" className="clearAllButton" onClick={onClearSentence}>
						Clear all
					</button>
				)}
				{showAnswerButtons && (
					<button
						type="button"
						className="checkButton"
						onClick={checkAnswer}
						disabled={isCheckDisabled}
					>
						{isChecking ? "Checking..." : feedback ? "Check again" : "Check"}
					</button>
				)}
				{feedback && !isSandboxCheck && (
					<button
						type="button"
						className="nextButton"
						onClick={onNext}
						disabled={promptStatus === "loading"}
					>
						Next
					</button>
				)}
			</div>

			{showAnswerButtons && !isSandboxCheck && (
				<div className="gameFeedbackDefaultSetting">
					<span>Show feedback by default</span>
					<button
						type="button"
						className={`gameFeedbackDefaultToggle ${
							showFeedbackByDefault ? "gameFeedbackDefaultToggleOn" : ""
						}`}
						role="switch"
						aria-label="Show feedback by default"
						aria-checked={showFeedbackByDefault}
						onClick={toggleShowFeedbackByDefault}
					>
						<span aria-hidden="true" />
					</button>
				</div>
			)}
		</div>
	)
}

function hasGameAnswerChecker(gameMode: string) {
	return Boolean(gameMode)
}

function getGameApiError(error: unknown): GameApiError {
	return error && typeof error === "object" ? (error as GameApiError) : {}
}

function gameCheckErrorFeedback(error: GameApiError) {
	const errorCode = error?.data?.error?.code

	if (isAuthenticationRequiredError(error)) {
		return "Log in to check challenge answers."
	}

	if (errorCode === "DAILY_GAME_LIMIT_REACHED") {
		return error?.message || "You're out of challenge checks for today."
	}

	if (errorCode === "AI_SERVICE_ERROR" || errorCode === "AI_SERVICE_NOT_CONFIGURED") {
		return "The AI checker is unavailable right now. Try again in a moment."
	}

	if (error?.status >= 500) {
		return "The checker is unavailable right now. Try again in a moment."
	}

	return "Could not check the sentence right now. Try again in a moment."
}

function isAuthenticationRequiredError(error: GameApiError) {
	const errorCode = error?.data?.error?.code

	return (
		errorCode === "LOGIN_REQUIRED_FOR_CHALLENGE_CHECKS" ||
		errorCode === "AUTHENTICATION_REQUIRED" ||
		error?.status === 401
	)
}
