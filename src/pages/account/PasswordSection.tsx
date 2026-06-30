import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { Lock } from "lucide-react"
import { getErrorMessage } from "../../api/errors"
import { updateUser } from "../../api/users"
import type { User } from "../../api/types"
import InputBox from "../../components/InputBox"
import "../auth/AuthPage.css"
import AccountSectionHeader from "./AccountSectionHeader"

type PasswordFormField = "currentPassword" | "password" | "confirmPassword"

interface ResetMessage {
	status?: string
	message?: string
}

interface PasswordSectionProps {
	currentUser: User
	onUserUpdate: (user: User) => void
	resetMessage?: ResetMessage | null
}

export default function PasswordSection({
	currentUser,
	onUserUpdate,
	resetMessage,
}: PasswordSectionProps) {
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		password: "",
		confirmPassword: "",
	})

	const [feedback, setFeedback] = useState({
		status: "idle",
		message: "",
	})

	useEffect(() => {
		if (!resetMessage) return

		setFeedback({
			status: resetMessage.status || "success",
			message: resetMessage.message || "Password reset successful.",
		})
	}, [resetMessage])

	function updatePasswordField(field: PasswordFormField, value: string) {
		setPasswordForm((prev) => ({
			...prev,
			[field]: value,
		}))

		setFeedback({
			status: "idle",
			message: "",
		})
	}

	async function submitPassword(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()

		if (passwordForm.password !== passwordForm.confirmPassword) {
			setFeedback({
				status: "error",
				message: "Passwords must match",
			})
			return
		}

		setFeedback({
			status: "submitting",
			message: "",
		})

		try {
			const data = await updateUser(currentUser.id, {
				currentPassword: passwordForm.currentPassword,
				password: passwordForm.password,
			})

			onUserUpdate(data.user)

			setPasswordForm({
				currentPassword: "",
				password: "",
				confirmPassword: "",
			})

			setFeedback({
				status: "success",
				message: data.message || "Password updated.",
			})
		} catch (error) {
			setFeedback({
				status: "error",
				message: getErrorMessage(error, "Password update failed."),
			})
		}
	}

	return (
		<form
			className="accountSection"
			aria-label="Password settings"
			onSubmit={submitPassword}
			noValidate
		>
			<AccountSectionHeader headingId="password-settings-heading" icon={Lock} title="Password" />

			<InputBox
				id="account-current-password"
				fieldClassName="accountField"
				label="Current password"
				value={passwordForm.currentPassword}
				onChange={(value) => updatePasswordField("currentPassword", value)}
				autoComplete="current-password"
				isPassword
				required
			/>

			<InputBox
				id="account-password"
				fieldClassName="accountField"
				label="New password"
				value={passwordForm.password}
				onChange={(value) => updatePasswordField("password", value)}
				autoComplete="new-password"
				isPassword
				required
			/>

			<InputBox
				id="account-password-confirmation"
				fieldClassName="accountField"
				label="Confirm new password"
				value={passwordForm.confirmPassword}
				onChange={(value) => updatePasswordField("confirmPassword", value)}
				autoComplete="new-password"
				isPassword
				required
			/>

			<Link to="/forgot-password" className="authTextButton" state={{ from: "account" }}>
				Forgot password?
			</Link>

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
