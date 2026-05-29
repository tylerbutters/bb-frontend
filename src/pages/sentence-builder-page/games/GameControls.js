import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { checkGameAnswer, checkSandboxSentence } from "../../../api/games"
import { recordLocalGameResult } from "../../../gameStatsStorage"
import "./GameControls.css"

const FREE_DAILY_CHALLENGE_LIMIT = 3
const EXHAUSTED_FREE_QUOTA = {
	plan: "free",
	limit: FREE_DAILY_CHALLENGE_LIMIT,
	used: FREE_DAILY_CHALLENGE_LIMIT,
	remaining: 0,
	canPlay: false,
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
	onGameQuotaChange,
	onLocalGameQuotaUse,
	onNext,
}) {
	const [checkStatus, setCheckStatus] = useState("idle")
	const [feedback, setFeedback] = useState(null)
	const hasAnswerChecker = hasGameAnswerChecker(gameMode)
	const isSandboxCheck = gameMode === "sandbox"
	const isChecking = checkStatus === "checking"
	const isChallengeCheck = hasAnswerChecker && !isSandboxCheck
	const requiresLogin = isChallengeCheck && !currentUser
	const isFreeQuota =
		isChallengeCheck && !requiresLogin && currentUser && gameQuota?.plan !== "premium"
	const isQuotaExhausted = Boolean(!requiresLogin && isFreeQuota && gameQuota?.remaining === 0)
	const isCheckDisabled =
		!answer ||
		isChecking ||
		(!isSandboxCheck && (!prompt || promptStatus !== "ready")) ||
		requiresLogin ||
		isQuotaExhausted
	const feedbackText =
		feedback &&
		`${feedback.correct ? "Correct." : "Not quite."}${
			feedback.feedback ? ` ${feedback.feedback}` : ""
		}`

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
			const errorCode = error.data?.error?.code
			const quota = error.data?.error?.details?.quota
			if (quota) onGameQuotaChange?.(quota)

			if (errorCode === "LOGIN_REQUIRED_FOR_CHALLENGE_CHECKS") {
				if (currentUser) {
					onGameQuotaChange?.(EXHAUSTED_FREE_QUOTA)
				}
				setFeedback(null)
				setCheckStatus("idle")
				return
			}

			const errorFeedback =
				errorCode === "DAILY_GAME_LIMIT_REACHED"
					? `You've used today's ${FREE_DAILY_CHALLENGE_LIMIT} free challenge checks.`
					: "Could not check the sentence right now. Try again in a moment."
			setFeedback({
				correct: false,
				feedback: errorFeedback,
			})
			setCheckStatus("error")
		}
	}

	if (!isVisible || !hasAnswerChecker) return null

	return (
		<div className="gameControls">
			{requiresLogin && (
				<div className="gameQuotaBlocker" role="status">
					<p>Sign up to check challenge answers</p>
					<Link className="gameQuotaButton" to="/login">
						Sign up
					</Link>
				</div>
			)}
			{isQuotaExhausted && (
				<div className="gameQuotaBlocker" role="status">
					<p>You've used today's {FREE_DAILY_CHALLENGE_LIMIT} free challenge checks.</p>
					<p>Buy premium for unlimited practice.</p>
					<Link className="gameQuotaButton" to="/buy">
						Buy premium
					</Link>
				</div>
			)}
			{feedback && (
				<div
					className={`gameFeedback ${
						feedback.correct ? "gameFeedbackSuccess" : "gameFeedbackWarning"
					}`}
					role="status"
				>
					{feedbackText}
				</div>
			)}
			{!requiresLogin && !isQuotaExhausted && (
				<button
					type="button"
					className="gameControlButton"
					onClick={checkAnswer}
					disabled={isCheckDisabled}
				>
					{isChecking ? "Checking..." : "Check"}
				</button>
			)}
			{feedback && !isSandboxCheck && (
				<button
					type="button"
					className="gameControlButton gameControlButtonPrimary"
					onClick={onNext}
					disabled={promptStatus === "loading"}
				>
					Next
				</button>
			)}
		</div>
	)
}

function hasGameAnswerChecker(gameMode) {
	return Boolean(gameMode)
}
