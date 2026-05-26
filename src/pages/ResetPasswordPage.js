import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { confirmPasswordReset, login, requestPasswordReset } from "../api/auth"
import InputBox from "../components/InputBox"
import "./TopRightButton.css"
import "./AuthPage.css"

const RESEND_CODE_COOLDOWN_SECONDS = 30

export default function ResetPasswordPage({
	setLoginForm,
	setLoginStatus,
	setLoginMessage,
	setLoginMessageType,
	showLogin,
}) {
	const [authMode, setAuthMode] = useState("requestReset")
	const [resetStatus, setResetStatus] = useState("idle")
	const [resetAction, setResetAction] = useState(null)
	const [resetMessage, setResetMessage] = useState("")
	const [resetMessageType, setResetMessageType] = useState("error")
	const [resendCooldown, setResendCooldown] = useState(0)
	const [resetForm, setResetForm] = useState({
		email: "",
		code: "",
		password: "",
	})
	useEffect(() => {
		if (authMode !== "confirmReset" || resendCooldown <= 0) return undefined

		const timerId = setTimeout(() => {
			setResendCooldown((cooldown) => Math.max(cooldown - 1, 0))
		}, 1000)

		return () => clearTimeout(timerId)
	}, [authMode, resendCooldown])

	const isSendingResetRequest = resetStatus === "submitting" && resetAction === "request"
	const isConfirmingReset = resetStatus === "submitting" && resetAction === "confirm"
	const isResendingResetCode = resetStatus === "submitting" && resetAction === "resend"
	const isResendDisabled = resendCooldown > 0 || isResendingResetCode || isConfirmingReset

	function updateResetField(field, value) {
		setResetForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setResetStatus("idle")
		setResetAction(null)
		setResetMessage("")
	}

	async function submitPasswordResetRequest(e) {
		e.preventDefault()
		setResetStatus("submitting")
		setResetAction("request")
		setResetMessage("")

		try {
			const result = await requestPasswordReset({ email: resetForm.email })
			setResetStatus("success")
			setResetAction(null)
			setResetMessageType("success")
			setResetMessage(result.message || "If an account exists, a reset code has been sent.")
			setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS)
			setAuthMode("confirmReset")
		} catch (error) {
			setResetStatus("error")
			setResetAction(null)
			setResetMessageType("error")
			setResetMessage(error.message || "Could not send reset code.")
		}
	}

	async function submitPasswordResetConfirm(e) {
		e.preventDefault()
		setResetStatus("submitting")
		setResetAction("confirm")
		setResetMessage("")

		try {
			await confirmPasswordReset(resetForm)
			setAuthMode("login")
			setLoginForm({ email: resetForm.email, password: "" })
			setLoginStatus("success")
			setLoginMessageType("success")
			setLoginMessage("Password reset successful. You can log in with your new password.")

			setResetForm({ email: resetForm.email, code: "", password: "", confirmPassword: "" })
			setResetStatus("idle")
			setResetAction(null)
			setResendCooldown(0)
		} catch (error) {
			setResetStatus("error")
			setResetAction(null)
			setResetMessageType("error")
			setResetMessage(error.message || "Password reset failed.")
		}
	}

	async function resendPasswordResetCode() {
		if (isResendDisabled) return

		setResetStatus("submitting")
		setResetAction("resend")
		setResetMessage("")

		try {
			const result = await requestPasswordReset({ email: resetForm.email })
			setResetStatus("success")
			setResetAction(null)
			setResetMessageType("success")
			setResetMessage(result.message || "If an account exists, a reset code has been sent.")
			setResetForm((prev) => ({
				...prev,
				code: "",
			}))
			setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS)
		} catch (error) {
			setResetStatus("error")
			setResetAction(null)
			setResetMessageType("error")
			setResetMessage(error.message || "Could not send reset code.")
		}
	}

	if (authMode === "confirmReset") {
		return (
			<form
				className="loginForm"
				method="post"
				action="/login/password-reset/confirm"
				onSubmit={submitPasswordResetConfirm}
			>
				<h1>Reset Password</h1>
				<p className="resetEmailNotice">
					Email sent to <span className="resetEmailAddress">{resetForm.email}</span>.{" "}
					<button
						type="button"
						className="resetEmailChangeButton"
						onClick={() => setAuthMode("requestReset")}
						disabled={isConfirmingReset || isResendingResetCode}
					>
						Change email
					</button>
				</p>
				<InputBox
					id="reset-code"
					name="code"
					fieldClassName="loginField"
					label="Code"
					inputMode="numeric"
					pattern="[0-9]{6}"
					value={resetForm.code}
					onChange={(value) => updateResetField("code", value)}
					autoComplete="one-time-code"
				/>
				<InputBox
					id="reset-password"
					name="password"
					fieldClassName="loginField"
					label="New password"
					value={resetForm.password}
					onChange={(value) => updateResetField("password", value)}
					autoComplete="new-password"
					isPassword
				/>
				<InputBox
					id="confirm-reset-password"
					name="confirmPassword"
					fieldClassName="loginField"
					label="Confirm new password"
					value={resetForm.confirmPassword}
					onChange={(value) => updateResetField("confirmPassword", value)}
					autoComplete="new-password"
					isPassword
				/>
				<button type="submit" className="loginSubmitButton" disabled={isConfirmingReset}>
					{isConfirmingReset ? "Resetting password..." : "Reset password"}
				</button>
				<button
					type="button"
					className="authTextButton"
					onClick={resendPasswordResetCode}
					disabled={isResendDisabled}
				>
					{isResendingResetCode
						? "Sending code..."
						: resendCooldown > 0
							? `Resend code in ${resendCooldown}s`
							: "Resend code"}
				</button>
				{resetMessage && (
					<p className={`loginMessage loginMessage${resetMessageType}`}>{resetMessage}</p>
				)}
			</form>
		)
	}

	return (
		<form
			className="loginForm"
			method="post"
			action="/login/password-reset/request"
			onSubmit={submitPasswordResetRequest}
		>
			<h1>Reset Password</h1>
			<InputBox
				id="reset-email"
				name="email"
				fieldClassName="loginField"
				label="Email"
				type="email"
				value={resetForm.email}
				onChange={(value) => updateResetField("email", value)}
				autoComplete="username"
			/>
			<button type="submit" className="loginSubmitButton" disabled={isSendingResetRequest}>
				{isSendingResetRequest ? "Sending code..." : "Send code"}
			</button>
			<button type="button" className="authTextButton" onClick={showLogin}>
				Back to login
			</button>
			{resetMessage && (
				<p className={`loginMessage loginMessage${resetMessageType}`}>{resetMessage}</p>
			)}
		</form>
	)
}
