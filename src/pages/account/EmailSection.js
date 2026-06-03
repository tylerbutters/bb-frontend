import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Mail, Save } from "lucide-react"
import { requestEmailChange } from "../../api/users"
import InputBox from "../../components/InputBox"
import "../auth/AuthPage.css"
import AccountSectionHeader from "./AccountSectionHeader"

export default function EmailSection({ currentUser, onUserUpdate }) {
	const location = useLocation()

	const [newEmail, setNewEmail] = useState(currentUser?.email || "")
	const [feedback, setFeedback] = useState({
		status: "idle",
		message: "",
	})

	useEffect(() => {
		if (!location.state?.emailState) return
		setFeedback({
			status: location.state.emailState.status,
			message: location.state.emailState.message,
		})
	}, [location.state?.emailState])

	useEffect(() => {
		setNewEmail(currentUser?.email || "")
	}, [currentUser?.email])

	async function submitEmail(e) {
		e.preventDefault()

		setFeedback({
			status: "submitting",
			message: "",
		})

		try {
			await requestEmailChange(currentUser.id, { email: newEmail })

			setFeedback({
				status: "success",
				message: `A verification link has been sent to ${currentUser.email}`,
			})
		} catch (error) {
			setFeedback({
				status: "error",
				message: error.message || "Email update failed.",
			})
		}
	}

	function updateEmail(value) {
		setNewEmail(value)
		setFeedback({
			status: "idle",
			message: "",
		})
	}

	return (
		<form className="accountSection" aria-label="Email settings" onSubmit={submitEmail} noValidate>
			<AccountSectionHeader
				headingId="email-settings-heading"
				icon={Mail}
				title="Email"
			/>

			<InputBox
				id="account-email"
				fieldClassName="accountField"
				label="Email"
				type="email"
				value={newEmail}
				onChange={updateEmail}
				autoComplete="email"
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
