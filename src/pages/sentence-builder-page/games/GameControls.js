import { useEffect, useState } from "react"
import { checkGameAnswer } from "../../../api/games"
import "./GameControls.css"

export default function GameControls({
	isVisible,
	gameMode,
	prompt,
	promptStatus,
	answer,
	onNext,
}) {
	const [checkStatus, setCheckStatus] = useState("idle")
	const [feedback, setFeedback] = useState(null)
	const hasAnswerChecker = hasGameAnswerChecker(gameMode)
	const isChecking = checkStatus === "checking"
	const isCheckDisabled = !prompt || !answer || promptStatus !== "ready" || isChecking
	const feedbackText =
		feedback &&
		`${feedback.correct ? "Correct." : "Not quite."}${
			feedback.feedback ? ` ${feedback.feedback}` : ""
		}`

	useEffect(() => {
		setFeedback(null)
		setCheckStatus("idle")
	}, [answer, gameMode, isVisible, prompt])

	async function checkAnswer() {
		if (isCheckDisabled) return

		setCheckStatus("checking")
		setFeedback(null)

		try {
			const nextFeedback = await checkGameAnswer({ gameMode, prompt, answer })
			setFeedback(nextFeedback)
			setCheckStatus("ready")
		} catch (error) {
			console.log(error)
			setFeedback({
				correct: false,
				feedback: "Could not check the sentence right now. Try again in a moment.",
			})
			setCheckStatus("error")
		}
	}

	if (!isVisible || !hasAnswerChecker) return null

	return (
		<div className="gameControls">
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
			<button
				type="button"
				className="gameControlButton"
				onClick={checkAnswer}
				disabled={isCheckDisabled}
			>
				{isChecking ? "Checking..." : "Check"}
			</button>
			{feedback && (
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
	return Boolean(gameMode && gameMode !== "sandbox")
}
