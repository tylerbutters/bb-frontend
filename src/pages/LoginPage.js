import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { confirmPasswordReset, login, requestPasswordReset } from "../api/auth"
import "./TopRightButton.css"
import "./AuthPage.css"

export default function LoginPage({ onLogin }) {
	const navigate = useNavigate()
	const [authMode, setAuthMode] = useState("login")
	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	})
	const [resetForm, setResetForm] = useState({
		email: "",
		code: "",
		password: "",
	})
	const [loginStatus, setLoginStatus] = useState("idle")
	const [loginMessage, setLoginMessage] = useState("")
	const [loginMessageType, setLoginMessageType] = useState("error")
	const [resetStatus, setResetStatus] = useState("idle")
	const [resetMessage, setResetMessage] = useState("")
	const [resetMessageType, setResetMessageType] = useState("error")
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	function updateLoginField(field, value) {
		setLoginForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setLoginStatus("idle")
		setLoginMessage("")
	}

	function updateResetField(field, value) {
		setResetForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setResetStatus("idle")
		setResetMessage("")
	}

	function showPasswordResetRequest() {
		setAuthMode("requestReset")
		setResetForm((prev) => ({
			...prev,
			email: prev.email || loginForm.email,
		}))
		setLoginMessage("")
		setResetMessage("")
	}

	function showLogin() {
		setAuthMode("login")
		setResetMessage("")
		setResetStatus("idle")
	}

	async function submitLogin(e) {
		e.preventDefault()
		setLoginStatus("submitting")
		setLoginMessage("")

		try {
			const user = await login(loginForm)
			onLogin(user)
			navigate("/")
		} catch (error) {
			setLoginStatus("error")
			setLoginMessageType("error")
			setLoginMessage(error.message || "Login failed.")
		}
	}

	async function submitPasswordResetRequest(e) {
		e.preventDefault()
		setResetStatus("submitting")
		setResetMessage("")

		try {
			const result = await requestPasswordReset({ email: resetForm.email })
			setResetStatus("success")
			setResetMessageType("success")
			setResetMessage(result.message || "If an account exists, a reset code has been sent.")
			setAuthMode("confirmReset")
		} catch (error) {
			setResetStatus("error")
			setResetMessageType("error")
			setResetMessage(error.message || "Could not send reset code.")
		}
	}

	async function submitPasswordResetConfirm(e) {
		e.preventDefault()
		setResetStatus("submitting")
		setResetMessage("")

		try {
			await confirmPasswordReset(resetForm)
			setAuthMode("login")
			setLoginForm({ email: resetForm.email, password: "" })
			setResetForm({ email: resetForm.email, code: "", password: "" })
			setLoginStatus("success")
			setLoginMessageType("success")
			setLoginMessage("Password reset successful. You can log in with your new password.")
		} catch (error) {
			setResetStatus("error")
			setResetMessageType("error")
			setResetMessage(error.message || "Password reset failed.")
		}
	}

	return (
		<div className="app loginPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			{authMode === "login" && (
				<form className="loginForm" method="post" action="/login" onSubmit={submitLogin}>
					<h1>Login</h1>
					<label className="loginField" htmlFor="login-email">
						<span>Email</span>
						<input
							id="login-email"
							name="email"
							type="email"
							value={loginForm.email}
							onChange={(e) => updateLoginField("email", e.target.value)}
							autoComplete="username"
						/>
					</label>
					<label className="loginField" htmlFor="login-password">
						<span>Password</span>
						<div className="passwordInputWrap">
							<input
								id="login-password"
								name="password"
								type={isPasswordVisible ? "text" : "password"}
								value={loginForm.password}
								onChange={(e) => updateLoginField("password", e.target.value)}
								autoComplete="current-password"
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
					<button
						type="submit"
						className="loginSubmitButton"
						disabled={loginStatus === "submitting"}
					>
						{loginStatus === "submitting" ? "Logging in..." : "Login"}
					</button>
					<button type="button" className="authTextButton" onClick={showPasswordResetRequest}>
						Forgot password?
					</button>
					{loginMessage && (
						<p className={`loginMessage loginMessage${loginMessageType}`}>{loginMessage}</p>
					)}
					<p className="authSwitchText">
						Don't have an account? <Link to="/signup">Sign up</Link>
					</p>
				</form>
			)}
			{authMode === "requestReset" && (
				<form
					className="loginForm"
					method="post"
					action="/login/password-reset/request"
					onSubmit={submitPasswordResetRequest}
				>
					<h1>Reset Password</h1>
					<label className="loginField" htmlFor="reset-email">
						<span>Email</span>
						<input
							id="reset-email"
							name="email"
							type="email"
							value={resetForm.email}
							onChange={(e) => updateResetField("email", e.target.value)}
							autoComplete="username"
						/>
					</label>
					<button
						type="submit"
						className="loginSubmitButton"
						disabled={resetStatus === "submitting"}
					>
						{resetStatus === "submitting" ? "Sending code..." : "Send code"}
					</button>
					<button type="button" className="authTextButton" onClick={showLogin}>
						Back to login
					</button>
					{resetMessage && (
						<p className={`loginMessage loginMessage${resetMessageType}`}>{resetMessage}</p>
					)}
				</form>
			)}
			{authMode === "confirmReset" && (
				<form
					className="loginForm"
					method="post"
					action="/login/password-reset/confirm"
					onSubmit={submitPasswordResetConfirm}
				>
					<h1>Reset Password</h1>
					<label className="loginField" htmlFor="confirm-reset-email">
						<span>Email</span>
						<input
							id="confirm-reset-email"
							name="email"
							type="email"
							value={resetForm.email}
							onChange={(e) => updateResetField("email", e.target.value)}
							autoComplete="username"
						/>
					</label>
					<label className="loginField" htmlFor="reset-code">
						<span>Code</span>
						<input
							id="reset-code"
							name="code"
							type="text"
							inputMode="numeric"
							pattern="[0-9]{6}"
							value={resetForm.code}
							onChange={(e) => updateResetField("code", e.target.value)}
							autoComplete="one-time-code"
						/>
					</label>
					<label className="loginField" htmlFor="reset-password">
						<span>New password</span>
						<div className="passwordInputWrap">
							<input
								id="reset-password"
								name="password"
								type={isPasswordVisible ? "text" : "password"}
								value={resetForm.password}
								onChange={(e) => updateResetField("password", e.target.value)}
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
					<button
						type="submit"
						className="loginSubmitButton"
						disabled={resetStatus === "submitting"}
					>
						{resetStatus === "submitting" ? "Resetting password..." : "Reset password"}
					</button>
					<button type="button" className="authTextButton" onClick={showPasswordResetRequest}>
						Send a new code
					</button>
					{resetMessage && (
						<p className={`loginMessage loginMessage${resetMessageType}`}>{resetMessage}</p>
					)}
				</form>
			)}
		</div>
	)
}
