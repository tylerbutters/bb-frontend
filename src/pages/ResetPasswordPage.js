import { useEffect, useState } from "react"
import { confirmPasswordReset, requestPasswordReset } from "../api/auth"
import InputBox from "../components/InputBox"
import "./TopRightButton.css"
import "./AuthPage.css"

const RESEND_CODE_COOLDOWN_SECONDS = 30

export default function ResetPasswordPage({ goBack, onComplete }) {
	const [currentPage, setCurrentPage] = useState("requestReset")

	const [isRequestingReset, setIsRequestingReset] = useState(false)
	const [isConfirmingReset, setIsConfirmingReset] = useState(false)
	const [isResendingCode, setIsResendingCode] = useState(false)

	const [requestResetMessage, setRequestResetMessage] = useState({
		text: "",
		type: "error",
	})

	const [confirmResetMessage, setConfirmResetMessage] = useState({
		text: "",
		type: "error",
	})

	const [resendCooldown, setResendCooldown] = useState(0)

	const [resetForm, setResetForm] = useState({
		email: "",
		code: "",
		password: "",
		confirmPassword: "",
	})

	useEffect(() => {
		if (currentPage !== "confirmReset" || resendCooldown <= 0) return undefined

		const timerId = setTimeout(() => {
			setResendCooldown((cooldown) => Math.max(cooldown - 1, 0))
		}, 1000)

		return () => clearTimeout(timerId)
	}, [currentPage, resendCooldown])

	const isResendDisabled = resendCooldown > 0 || isResendingCode || isConfirmingReset

	function updateResetField(field, value) {
		setResetForm((prev) => ({
			...prev,
			[field]: value,
		}))

		if (currentPage === "requestReset") {
			setRequestResetMessage({ text: "", type: "error" })
			return
		}

		setConfirmResetMessage({ text: "", type: "error" })
	}

	async function submitPasswordResetRequest(e) {
		e.preventDefault()

		setIsRequestingReset(true)
		setRequestResetMessage({ text: "", type: "error" })

		try {
			const result = await requestPasswordReset({ email: resetForm.email })

			setConfirmResetMessage({
				text: result.message || "If an account exists, a reset code has been sent.",
				type: "success",
			})

			setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS)
			setCurrentPage("confirmReset")
		} catch (error) {
			setRequestResetMessage({
				text: error.message || "Could not send reset code.",
				type: "error",
			})
		} finally {
			setIsRequestingReset(false)
		}
	}

	async function submitPasswordResetConfirm(e) {
		e.preventDefault()

		setIsConfirmingReset(true)
		setConfirmResetMessage({ text: "", type: "error" })

		try {
			await confirmPasswordReset(resetForm)

			onComplete({
				email: resetForm.email,
				status: "success",
				messageType: "success",
				message: "Password reset successful. You can log in with your new password.",
			})

			setResetForm({
				email: resetForm.email,
				code: "",
				password: "",
				confirmPassword: "",
			})

			setResendCooldown(0)
		} catch (error) {
			setConfirmResetMessage({
				text: error.message || "Password reset failed.",
				type: "error",
			})
		} finally {
			setIsConfirmingReset(false)
		}
	}

	async function resendPasswordResetCode() {
		if (isResendDisabled) return

		setIsResendingCode(true)
		setConfirmResetMessage({ text: "", type: "error" })

		try {
			const result = await requestPasswordReset({ email: resetForm.email })

			setConfirmResetMessage({
				text: result.message || "A new reset code has been sent.",
				type: "success",
			})

			setResetForm((prev) => ({
				...prev,
				code: "",
			}))

			setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS)
		} catch (error) {
			setConfirmResetMessage({
				text: error.message || "Could not resend reset code.",
				type: "error",
			})
		} finally {
			setIsResendingCode(false)
		}
	}

	function changeEmail() {
		setCurrentPage("requestReset")
		setConfirmResetMessage({ text: "", type: "error" })
		setResendCooldown(0)
	}

	if (currentPage === "confirmReset") {
		return (
			<div className="app loginPage">
				<button className="topRightButton" onClick={() => setCurrentPage("requestReset")}>
					Back
				</button>
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
							onClick={changeEmail}
							disabled={isConfirmingReset || isResendingCode}
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
						{isResendingCode
							? "Sending code..."
							: resendCooldown > 0
								? `Resend code in ${resendCooldown}s`
								: "Resend code"}
					</button>

					{confirmResetMessage.text && (
						<p className={`loginMessage loginMessage${confirmResetMessage.type}`}>
							{confirmResetMessage.text}
						</p>
					)}
				</form>
			</div>
		)
	}

	return (
		<div className="app loginPage">
			<button className="topRightButton" onClick={goBack}>
				Back
			</button>
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

				<button type="submit" className="loginSubmitButton" disabled={isRequestingReset}>
					{isRequestingReset ? "Sending code..." : "Send code"}
				</button>

				{requestResetMessage.text && (
					<p className={`loginMessage loginMessage${requestResetMessage.type}`}>
						{requestResetMessage.text}
					</p>
				)}
			</form>
		</div>
	)
}
