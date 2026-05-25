import { useEffect, useState } from "react"

export default function GameControls({ isVisible, gameMode, prompt, promptStatus, answer, onNext }) {
	const [checkStatus, setCheckStatus] = useState("idle")
	const [feedback, setFeedback] = useState(null)
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

	if (!isVisible) return null

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

async function checkGameAnswer({ gameMode, prompt, answer }) {
	switch (gameMode) {
		case "translate":
			return checkTranslateAnswer({ prompt, answer })
		default:
			throw new Error(`No answer checker configured for ${gameMode}.`)
	}
}

async function checkTranslateAnswer({ prompt, answer }) {
	const response = await fetch("/api/v1/games/translate/check", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			englishSentence: prompt,
			japaneseSentence: answer,
		}),
	})

	if (!response.ok) {
		throw new Error(`Check request failed with ${response.status}.`)
	}

	const data = await response.json()
	return {
		correct: Boolean(data.correct),
		feedback: data.feedback || "",
	}
}
