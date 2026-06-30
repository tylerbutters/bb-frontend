import { useState } from "react"
import type { FormEvent } from "react"
import { getErrorMessage } from "../../api/errors"
import { sendSuggestion } from "../../api/suggestions"
import "../auth/AuthPage.css"
import "./SuggestionsPage.css"

export default function SuggestionsPage() {
	const [suggestion, setSuggestion] = useState("")
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")
	const isSubmitting = status === "submitting"

	function updateSuggestion(value: string) {
		setSuggestion(value)
		setStatus("idle")
		setMessage("")
	}

	async function submitSuggestion(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const trimmedSuggestion = suggestion.trim()

		if (!trimmedSuggestion) {
			setStatus("error")
			setMessage("Suggestion is required")
			return
		}

		setStatus("submitting")
		setMessage("")

		try {
			const result = await sendSuggestion({ suggestion: trimmedSuggestion })
			setSuggestion("")
			setStatus("success")
			setMessage(result.message || "Thanks for the suggestion.")
		} catch (error) {
			setStatus("error")
			setMessage(getErrorMessage(error, "Could not send suggestion."))
		}
	}

	return (
		<div className="app accountPage suggestionsPage">
			<main className="accountContent suggestionsContent" aria-labelledby="suggestions-heading">
				<h1 id="suggestions-heading">Suggestions</h1>
				<form
					className="accountSection suggestionForm"
					method="post"
					action="/suggestions"
					onSubmit={submitSuggestion}
				>
					<label className="suggestionField" htmlFor="suggestion">
						<span>Suggestion</span>
						<textarea
							id="suggestion"
							name="suggestion"
							className="suggestionTextarea"
							value={suggestion}
							onChange={(e) => updateSuggestion(e.target.value)}
							disabled={isSubmitting}
							required
						/>
					</label>
					<button type="submit" className="authPrimaryButton" disabled={isSubmitting}>
						{isSubmitting ? "Sending..." : "Send suggestion"}
					</button>
					{message && (
						<p className={`accountMessage accountMessage${status}`}>{message}</p>
					)}
				</form>
			</main>
		</div>
	)
}
