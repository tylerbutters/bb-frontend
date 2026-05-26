import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { confirmSignup, requestSignupConfirmation } from "../api/users"
import "./TopRightButton.css"
import "./AuthPage.css"

const RESEND_CODE_COOLDOWN_SECONDS = 30

export default function SignupPage({ onSignup }) {
	const navigate = useNavigate()
	const [signupStep, setSignupStep] = useState("details")
	const [signupForm, setSignupForm] = useState({
		email: "",
		password: "",
		displayName: "",
	})
	const [confirmationCode, setConfirmationCode] = useState("")
	const [signupStatus, setSignupStatus] = useState("idle")
	const [signupAction, setSignupAction] = useState(null)
	const [signupMessage, setSignupMessage] = useState("")
	const [signupMessageType, setSignupMessageType] = useState("error")
	const [resendCooldown, setResendCooldown] = useState(0)
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	useEffect(() => {
		if (signupStep !== "confirm" || resendCooldown <= 0) return undefined

		const timerId = setTimeout(() => {
			setResendCooldown((cooldown) => Math.max(cooldown - 1, 0))
		}, 1000)

		return () => clearTimeout(timerId)
	}, [signupStep, resendCooldown])

	const isRequestingSignupCode = signupStatus === "submitting" && signupAction === "request"
	const isConfirmingSignup = signupStatus === "submitting" && signupAction === "confirm"
	const isResendingSignupCode = signupStatus === "submitting" && signupAction === "resend"
	const isResendDisabled = resendCooldown > 0 || isResendingSignupCode || isConfirmingSignup

	function updateSignupField(field, value) {
		setSignupForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setSignupStatus("idle")
		setSignupAction(null)
		setSignupMessage("")
	}

	function updateConfirmationCode(value) {
		setConfirmationCode(value)
		setSignupStatus("idle")
		setSignupAction(null)
		setSignupMessage("")
	}

	function showSignupDetails() {
		setSignupStep("details")
		setConfirmationCode("")
		setSignupStatus("idle")
		setSignupAction(null)
		setSignupMessage("")
		setResendCooldown(0)
	}

	async function submitSignupRequest(e) {
		e.preventDefault()
		setSignupStatus("submitting")
		setSignupAction("request")
		setSignupMessage("")

		try {
			const result = await requestSignupConfirmation(signupForm)
			setSignupStep("confirm")
			setSignupStatus("success")
			setSignupAction(null)
			setSignupMessageType("success")
			setSignupMessage(
				result.message ||
					"Confirmation code sent. Check your email to finish creating your account.",
			)
			setConfirmationCode("")
			setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS)
		} catch (error) {
			setSignupStatus("error")
			setSignupAction(null)
			setSignupMessageType("error")
			setSignupMessage(error.message || "Could not send confirmation code.")
		}
	}

	async function submitSignupConfirm(e) {
		e.preventDefault()
		setSignupStatus("submitting")
		setSignupAction("confirm")
		setSignupMessage("")

		try {
			const user = await confirmSignup({
				email: signupForm.email,
				code: confirmationCode,
			})
			onSignup(user)
			navigate("/")
		} catch (error) {
			setSignupStatus("error")
			setSignupAction(null)
			setSignupMessageType("error")
			setSignupMessage(error.message || "Sign up failed.")
		}
	}

	async function resendSignupCode() {
		if (isResendDisabled) return

		setSignupStatus("submitting")
		setSignupAction("resend")
		setSignupMessage("")

		try {
			const result = await requestSignupConfirmation(signupForm)
			setSignupStatus("success")
			setSignupAction(null)
			setSignupMessageType("success")
			setSignupMessage(
				result.message ||
					"Confirmation code sent. Check your email to finish creating your account.",
			)
			setConfirmationCode("")
			setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS)
		} catch (error) {
			setSignupStatus("error")
			setSignupAction(null)
			setSignupMessageType("error")
			setSignupMessage(error.message || "Could not send confirmation code.")
		}
	}

	return (
		<div className="app signupPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			{signupStep === "details" && (
				<form
					className="signupForm"
					method="post"
					action="/users/signup-confirmation/request"
					onSubmit={submitSignupRequest}
				>
					<h1>Sign up</h1>
					<label className="signupField" htmlFor="signup-display-name">
						<span>Display name</span>
						<input
							id="signup-display-name"
							name="displayName"
							type="text"
							value={signupForm.displayName}
							onChange={(e) => updateSignupField("displayName", e.target.value)}
							autoComplete="name"
						/>
					</label>
					<label className="signupField" htmlFor="signup-email">
						<span>Email</span>
						<input
							id="signup-email"
							name="email"
							type="email"
							value={signupForm.email}
							onChange={(e) => updateSignupField("email", e.target.value)}
							autoComplete="username"
						/>
					</label>
					<label className="signupField" htmlFor="signup-password">
						<span>Password</span>
						<div className="passwordInputWrap">
							<input
								id="signup-password"
								name="password"
								type={isPasswordVisible ? "text" : "password"}
								value={signupForm.password}
								onChange={(e) => updateSignupField("password", e.target.value)}
								autoComplete="new-password"
							/>
							<button
								type="button"
								className="passwordToggleButton"
								aria-label={isPasswordVisible ? "Hide password" : "Show password"}
								aria-pressed={isPasswordVisible}
								onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
							>
								{isPasswordVisible ? "Hide" : "Show"}
							</button>
						</div>
					</label>
					<button type="submit" className="signupSubmitButton" disabled={isRequestingSignupCode}>
						{isRequestingSignupCode ? "Sending code..." : "Send code"}
					</button>
					{signupMessage && (
						<p className={`signupMessage signupMessage${signupMessageType}`}>{signupMessage}</p>
					)}
					<p className="authSwitchText">
						Already have an account? <Link to="/login">Login</Link>
					</p>
				</form>
			)}
			{signupStep === "confirm" && (
				<form
					className="signupForm"
					method="post"
					action="/users/signup-confirmation/confirm"
					onSubmit={submitSignupConfirm}
				>
					<h1>Confirm email</h1>
					<p className="resetEmailNotice">
						Email sent to <span className="resetEmailAddress">{signupForm.email}</span>.{" "}
						<button
							type="button"
							className="resetEmailChangeButton"
							onClick={showSignupDetails}
							disabled={isConfirmingSignup || isResendingSignupCode}
						>
							Change details
						</button>
					</p>
					<label className="signupField" htmlFor="signup-code">
						<span>Code</span>
						<input
							id="signup-code"
							name="code"
							type="text"
							inputMode="numeric"
							pattern="[0-9]{6}"
							value={confirmationCode}
							onChange={(e) => updateConfirmationCode(e.target.value)}
							autoComplete="one-time-code"
						/>
					</label>
					<button type="submit" className="signupSubmitButton" disabled={isConfirmingSignup}>
						{isConfirmingSignup ? "Creating account..." : "Create account"}
					</button>
					<button
						type="button"
						className="authTextButton"
						onClick={resendSignupCode}
						disabled={isResendDisabled}
					>
						{isResendingSignupCode
							? "Sending code..."
							: resendCooldown > 0
								? `Resend code in ${resendCooldown}s`
								: "Resend code"}
					</button>
					{signupMessage && (
						<p className={`signupMessage signupMessage${signupMessageType}`}>{signupMessage}</p>
					)}
					<p className="authSwitchText">
						Already have an account? <Link to="/login">Login</Link>
					</p>
				</form>
			)}
		</div>
	)
}
