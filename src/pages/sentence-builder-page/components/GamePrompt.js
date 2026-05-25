export default function GamePrompt({ isVisible, label, prompt, status, onRegenerate }) {
	if (!isVisible) return null

	return (
		<section className="gamePromptPanel" aria-live="polite">
			<div className="gamePromptHeader">
				<div className="gamePromptLabel">{label}</div>
				<button
					type="button"
					className="gamePromptRegenerateButton"
					onClick={onRegenerate}
					disabled={status === "loading"}
				>
					{status === "loading" ? "Generating..." : "Regenerate"}
				</button>
			</div>
			<div className="gamePromptText">
				{status === "loading" && "Loading..."}
				{status === "error" && "Could not load a prompt."}
				{status === "ready" && prompt}
			</div>
		</section>
	)
}
