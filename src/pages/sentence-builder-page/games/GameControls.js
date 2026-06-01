import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { checkGameAnswer, checkSandboxSentence } from "../../../api/games"
import { recordLocalGameResult } from "../../../gameStatsStorage"
import "./GameControls.css"

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
	const [feedback, setFeedback] = useState(null)
	const hasAnswerChecker = hasGameAnswerChecker(gameMode)
	const isSandboxCheck = gameMode === "sandbox"
	const isChecking = checkStatus === "checking"
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
		setFeedback(null)
		setCheckStatus("idle")
	}, [answer, challengeId, difficulty, gameMode, isVisible, prompt])

	async function checkAnswer() {
		if (isCheckDisabled) return

		setCheckStatus("checking")
		setFeedback(null)

		try {
			const nextFeedback = isSandboxCheck
				? await checkSandboxSentence({ answer })
				: await checkGameAnswer({ gameMode, difficulty, prompt, answer, challengeId })
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
			setCheckStatus("ready")
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

			const errorFeedback = "Could not check the sentence right now. Try again in a moment."
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
			setCheckStatus("error")
		}
	}

	if (!isVisible || !hasAnswerChecker) return null

	const showAnswerButtons = !requiresLogin && !isQuotaExhausted
	const showClearButton = Boolean(onClearSentence && canClearSentence)
	const showFeedbackDetails = Boolean(feedback && !feedback.correct && feedback.feedback)

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
			{feedback && !isChecking && (
				<>
					<div
						className="statusText"
						style={{
							color: feedback.correct ? "var(--color-green-text)" : "var(--color-red-text)",
						}}
					>
						{feedback.correct ? "Correct." : "Not quite."}
					</div>
					{showFeedbackDetails && (
						<div className="gameFeedback gameFeedbackWarning" role="status">
							{feedback.feedback}
						</div>
					)}
				</>
			)}
			{showAnswerButtons && (
				<div className="buttonsContainer">
					<button
						type="button"
						className="checkButton"
						onClick={checkAnswer}
						disabled={isCheckDisabled}
					>
						{isChecking ? "Checking..." : feedback ? "Check again" : "Check"}
					</button>

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
			)}

			{showClearButton && (
				<button type="button" className="clearAllButton" onClick={onClearSentence}>
					Clear all
				</button>
			)}
		</div>
	)
}

function hasGameAnswerChecker(gameMode) {
	return Boolean(gameMode)
}
