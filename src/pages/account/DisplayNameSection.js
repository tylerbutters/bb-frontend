import { useEffect, useState } from "react"
import { Save, User } from "lucide-react"
import { updateUser } from "../../api/users"
import InputBox from "../../components/InputBox"
import "../auth/AuthPage.css"
import AccountSectionHeader from "./AccountSectionHeader"

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
			<AccountSectionHeader
				headingId="display-name-settings-heading"
				icon={User}
				title="Display name"
			/>

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
				className="authPrimaryButton"
				disabled={feedback.status === "submitting"}
			>
				<Save className="accountButtonIcon" size={16} aria-hidden="true" />
				<span>{feedback.status === "submitting" ? "Saving..." : "Save changes"}</span>
			</button>

			{feedback.message && (
				<p className={`accountMessage accountMessage${feedback.status}`}>{feedback.message}</p>
			)}
		</form>
	)
}
