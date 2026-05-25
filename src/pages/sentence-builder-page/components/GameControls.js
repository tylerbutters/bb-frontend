export default function GameControls({
	isVisible,
	feedback,
	isChecking,
	isCheckDisabled,
	onCheck,
	showNext,
	isNextDisabled,
	onNext,
}) {
	if (!isVisible) return null

	return (
		<div className="gameControls">
			{feedback && (
				<div className={`gameFeedback ${getFeedbackClassName(feedback.tone)}`} role="status">
					{feedback.text}
				</div>
			)}
			<button
				type="button"
				className="gameControlButton"
				onClick={onCheck}
				disabled={isCheckDisabled}
			>
				{isChecking ? "Checking..." : "Check"}
			</button>
			{showNext && (
				<button
					type="button"
					className="gameControlButton gameControlButtonPrimary"
					onClick={onNext}
					disabled={isNextDisabled}
				>
					Next
				</button>
			)}
		</div>
	)
}

function getFeedbackClassName(tone) {
	switch (tone) {
		case "success":
			return "gameFeedbackSuccess"
		case "warning":
			return "gameFeedbackWarning"
		default:
			return ""
	}
}
