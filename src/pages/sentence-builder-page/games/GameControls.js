import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { checkGameAnswer, checkSandboxSentence, getGameAnswerFeedback } from "../../../api/games"
import { recordLocalGameResult, updateLocalGameResultFeedback } from "../../../gameStatsStorage"
import "./GameControls.css"

const SHOW_FEEDBACK_BY_DEFAULT_STORAGE_KEY = "bbShowFeedbackByDefault"

function readShowFeedbackByDefault() {
	try {
		return window.localStorage.getItem(SHOW_FEEDBACK_BY_DEFAULT_STORAGE_KEY) !== "false"
	} catch {
		return true
	}
}

function writeShowFeedbackByDefault(value) {
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
	onClearSentence,
	onNext,
}) {
	const [checkStatus, setCheckStatus] = useState("idle")
	const [feedbackStatus, setFeedbackStatus] = useState("idle")
	const [feedback, setFeedback] = useState(null)
	const [showFeedbackByDefault, setShowFeedbackByDefault] = useState(readShowFeedbackByDefault)
	const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(showFeedbackByDefault)
	const feedbackRequestId = useRef(0)
	const feedbackAbortControllerRef = useRef(null)
	const hasAnswerChecker = hasGameAnswerChecker(gameMode)
	const isSandboxCheck = gameMode === "sandbox"
	const isChecking = checkStatus === "checking"
	const isFeedbackLoading = feedbackStatus === "loading"
	const isChallengeCheck = hasAnswerChecker && !isSandboxCheck
	const requiresLogin = isChallengeCheck && !currentUser
	const isQuotaExhausted = false
	/*
	TODO(premium): Re-enable free quota blocking when premium is live.
	const isFreeQuota =
		isChallengeCheck && !requiresLogin && currentUser && gameQuota?.plan !== "premium"
	const isQuotaExhausted = Boolean(!requiresLogin && isFreeQuota && gameQuota?.remaining === 0)
	*/
	const isCheckDisabled =
		!answer ||
		isChecking ||
		(!isSandboxCheck && (!prompt || promptStatus !== "ready")) ||
		requiresLogin ||
		isQuotaExhausted
	// const feedbackText =
	// 	feedback &&
	// 	`${feedback.correct ? "Correct." : "Not quite."}${
	// 		feedback.feedback ? ` ${feedback.feedback}` : ""
	// 	}`

	useEffect(() => {
		feedbackRequestId.current += 1
		abortFeedbackRequest(feedbackAbortControllerRef)
		setFeedback(null)
		setFeedbackStatus("idle")
		setIsFeedbackExpanded(showFeedbackByDefault)
		setCheckStatus("idle")

		return () => {
			feedbackRequestId.current += 1
			abortFeedbackRequest(feedbackAbortControllerRef)
		}
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

		feedbackRequestId.current += 1
		abortFeedbackRequest(feedbackAbortControllerRef)
		setCheckStatus("checking")
		setFeedbackStatus("idle")
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

			if (shouldLoadFeedbackSeparately({ isSandboxCheck, feedback: nextFeedback })) {
				loadFeedbackDetails(checkPayload)
				return
			}

			setFeedbackStatus("ready")
		} catch (error) {
			console.log(error)
			const quota = error.data?.error?.details?.quota
			if (quota) onGameQuotaChange?.(quota)

			/*
			TODO(premium): Re-enable quota exhaustion response handling when premium is live.
			const errorCode = error.data?.error?.code
			const EXHAUSTED_FREE_QUOTA = {
				plan: "free",
				limit: 3,
				used: 3,
				remaining: 0,
				canPlay: false,
			}
			if (errorCode === "LOGIN_REQUIRED_FOR_CHALLENGE_CHECKS") {
				if (currentUser) {
					onGameQuotaChange?.(EXHAUSTED_FREE_QUOTA)
				}
				setFeedback(null)
				setCheckStatus("idle")
				return
			}
			*/

			const errorFeedback = gameCheckErrorFeedback(error)
			/*
			TODO(premium): Re-enable premium-specific quota feedback.
			const errorFeedback =
				errorCode === "DAILY_GAME_LIMIT_REACHED"
					? "You've used today's 3 free challenge checks."
					: "Could not check the sentence right now. Try again in a moment."
			*/
			setFeedback({
				correct: false,
				feedback: errorFeedback,
			})
			setIsFeedbackExpanded(showFeedbackByDefault)
			setFeedbackStatus("ready")
			setCheckStatus("error")
		}
	}

	async function loadFeedbackDetails(checkPayload) {
		const requestId = feedbackRequestId.current + 1
		const abortController = new AbortController()
		feedbackRequestId.current = requestId
		abortFeedbackRequest(feedbackAbortControllerRef)
		feedbackAbortControllerRef.current = abortController
		setFeedbackStatus("loading")

		try {
			const nextFeedback = await getGameAnswerFeedback({
				...checkPayload,
				signal: abortController.signal,
			})
			if (feedbackRequestId.current !== requestId) return

			if (feedbackAbortControllerRef.current === abortController) {
				feedbackAbortControllerRef.current = null
			}
			if (nextFeedback.quota) onGameQuotaChange?.(nextFeedback.quota)
			updateLocalGameResultFeedback(currentUser?.id, {
				challengeId,
				mode: gameMode,
				prompt,
				feedback: nextFeedback.feedback,
			})
			setFeedback((currentFeedback) =>
				currentFeedback
					? {
							...currentFeedback,
							feedback: nextFeedback.feedback,
							feedbackPending: false,
						}
					: currentFeedback,
			)
			setFeedbackStatus("ready")
		} catch (error) {
			if (isAbortError(error)) return
			console.log(error)
			if (feedbackRequestId.current !== requestId) return

			if (feedbackAbortControllerRef.current === abortController) {
				feedbackAbortControllerRef.current = null
			}
			setFeedback((currentFeedback) =>
				currentFeedback
					? {
							...currentFeedback,
							feedback:
								currentFeedback.feedback ||
								feedbackLoadErrorFeedback(error),
							feedbackPending: false,
						}
					: currentFeedback,
			)
			setFeedbackStatus("error")
		}
	}

	if (!isVisible || !hasAnswerChecker) return null

	const showAnswerButtons = !requiresLogin && !isQuotaExhausted
	const showClearButton = Boolean(onClearSentence && canClearSentence)
	const hasFeedbackDetails = Boolean(feedback && !feedback.correct && feedback.feedback)
	const canToggleFeedback = Boolean(
		!isSandboxCheck && feedback && !feedback.correct && (hasFeedbackDetails || isFeedbackLoading),
	)
	const showFeedbackDetails = canToggleFeedback && isFeedbackExpanded

	return (
		<div className="gameControls">
			{requiresLogin && (
				<div className="gameQuotaBlocker" role="status">
					<p>Log in to check challenge answers.</p>
					<Link className="gameQuotaButton" to="/login">
						Login
					</Link>
				</div>
			)}
			{/* TODO(premium): Re-enable this blocker when free quotas return.
				<div className="gameQuotaBlocker" role="status">
					<p>You've used today's 3 free challenge checks.</p>
					<p>Buy premium for unlimited practice.</p>
					<Link className="gameQuotaButton" to="/buy">
						Buy premium
					</Link>
				</div>
			*/}
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
								aria-label={isFeedbackLoading ? "Loading feedback" : undefined}
							>
								{isFeedbackLoading ? (
									<span className="gameCheckingSpinner" aria-hidden="true" />
								) : (
									feedback.feedback
								)}
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

function hasGameAnswerChecker(gameMode) {
	return Boolean(gameMode)
}

function shouldLoadFeedbackSeparately({ isSandboxCheck, feedback }) {
	return Boolean(!isSandboxCheck && feedback?.feedbackPending && !feedback.correct)
}

function abortFeedbackRequest(feedbackAbortControllerRef) {
	feedbackAbortControllerRef.current?.abort()
	feedbackAbortControllerRef.current = null
}

function isAbortError(error) {
	return error?.name === "AbortError"
}

function gameCheckErrorFeedback(error) {
	const errorCode = error?.data?.error?.code

	if (
		errorCode === "LOGIN_REQUIRED_FOR_CHALLENGE_CHECKS" ||
		errorCode === "AUTHENTICATION_REQUIRED" ||
		error?.status === 401
	) {
		return "Log in to check challenge answers."
	}

	if (errorCode === "DAILY_GAME_LIMIT_REACHED") {
		return error?.message || "You've used today's free challenge checks."
	}

	if (errorCode === "AI_SERVICE_ERROR" || errorCode === "AI_SERVICE_NOT_CONFIGURED") {
		return "The AI checker is unavailable right now. Try again in a moment."
	}

	if (error?.status >= 500) {
		return "The checker is unavailable right now. Try again in a moment."
	}

	return "Could not check the sentence right now. Try again in a moment."
}

function feedbackLoadErrorFeedback(error) {
	const errorCode = error?.data?.error?.code

	if (
		errorCode === "LOGIN_REQUIRED_FOR_CHALLENGE_CHECKS" ||
		errorCode === "AUTHENTICATION_REQUIRED" ||
		error?.status === 401
	) {
		return "Log in to load AI feedback for this answer."
	}

	if (errorCode === "DAILY_GAME_LIMIT_REACHED") {
		return error?.message || "You've used today's free challenge checks."
	}

	if (errorCode === "CHALLENGE_FEEDBACK_NOT_AVAILABLE" || error?.status === 404) {
		return "Feedback is no longer available for this prompt. Try the next sentence."
	}

	if (errorCode === "AI_SERVICE_ERROR" || errorCode === "AI_SERVICE_NOT_CONFIGURED") {
		return "AI feedback is unavailable right now. Your answer was still checked."
	}

	if (error?.status >= 500) {
		return "Feedback is unavailable right now. Your answer was still checked."
	}

	return "Could not load feedback right now. Your answer was still checked."
}
