import { useEffect, useState } from "react"
import { updateUser } from "../../api/users"
import InputBox from "../../components/InputBox"
import "../TopRightButton.css"
import "../AuthPage.css"

export default function DisplayNameSection({ currentUser, onUserUpdate }) {
	const [displayName, setDisplayName] = useState(currentUser?.displayName || "")
	const [feedback, setFeedback] = useState({
		status: "idle",
		message: "",
	})

	useEffect(() => {
		setDisplayName(currentUser?.displayName || "")
	}, [currentUser?.displayName])

	async function submitDisplayName(e) {
		e.preventDefault()

		setFeedback({
			status: "submitting",
			message: "",
		})

		try {
			const data = await updateUser(currentUser.id, { displayName })

			onUserUpdate(data.user)

			setDisplayName(data.user.displayName || "")

			setFeedback({
				status: "success",
				message: data.message || "Display name updated.",
			})
		} catch (error) {
			setFeedback({
				status: "error",
				message: error.message || "Display name update failed.",
			})
		}
	}

	function updateDisplayName(value) {
		setDisplayName(value)
		setFeedback({
			status: "idle",
			message: "",
		})
	}

	return (
		<form
			className="accountSection"
			aria-label="Display name settings"
			onSubmit={submitDisplayName}
		>
			<h2>Display name</h2>

			<InputBox
				id="account-display-name"
				fieldClassName="accountField"
				label="Display name"
				value={displayName}
				onChange={updateDisplayName}
				autoComplete="name"
			/>

			<button
				type="submit"
				className="accountSubmitButton"
				disabled={feedback.status === "submitting"}
			>
				{feedback.status === "submitting" ? "Saving..." : "Save changes"}
			</button>

			{feedback.message && (
				<p className={`accountMessage accountMessage${feedback.status}`}>{feedback.message}</p>
			)}
		</form>
	)
}
