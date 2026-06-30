import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useLocation } from "react-router-dom"
import { Mail } from "lucide-react"
import { getErrorMessage } from "../../api/errors"
import { requestEmailChange } from "../../api/users"
import type { User } from "../../api/types"
import InputBox from "../../components/InputBox"
import "../auth/AuthPage.css"
import AccountSectionHeader from "./AccountSectionHeader"

interface EmailSectionProps {
	currentUser: User
	onUserUpdate: (user: User) => void
}

interface EmailRouteState {
	emailState?: {
		status: string
		message: string
	}
}

export default function EmailSection({ currentUser, onUserUpdate }: EmailSectionProps) {
	const location = useLocation()
	const routeState = location.state as EmailRouteState | null

	const [newEmail, setNewEmail] = useState(currentUser?.email || "")
	const [feedback, setFeedback] = useState({
		status: "idle",
		message: "",
	})

	useEffect(() => {
		if (!routeState?.emailState) return
		setFeedback({
			status: routeState.emailState.status,
			message: routeState.emailState.message,
		})
	}, [routeState?.emailState])

	useEffect(() => {
		setNewEmail(currentUser?.email || "")
	}, [currentUser?.email])

	async function submitEmail(e: FormEvent<HTMLFormElement>) {
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
				message: getErrorMessage(error, "Email update failed."),
			})
		}
	}

	function updateEmail(value: string) {
		setNewEmail(value)
		setFeedback({
			status: "idle",
			message: "",
		})
	}

	return (
		<form className="accountSection" aria-label="Email settings" onSubmit={submitEmail} noValidate>
			<AccountSectionHeader headingId="email-settings-heading" icon={Mail} title="Email" />

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
				{feedback.status === "submitting" ? "Saving..." : "Save changes"}
			</button>

			{feedback.message && (
				<p className={`accountMessage accountMessage${feedback.status}`}>{feedback.message}</p>
			)}
		</form>
	)
}
