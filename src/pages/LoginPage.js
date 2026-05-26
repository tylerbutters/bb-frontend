import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { confirmPasswordReset, login, requestPasswordReset } from "../api/auth"
import InputBox from "../components/InputBox"
import "./TopRightButton.css"
import "./AuthPage.css"
import ResetPasswordPage from "./ResetPasswordPage"

export default function LoginPage({ onLogin }) {
	const navigate = useNavigate()
	const [authMode, setAuthMode] = useState("login")
	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	})
	const [loginStatus, setLoginStatus] = useState("idle")
	const [loginMessage, setLoginMessage] = useState("")
	const [loginMessageType, setLoginMessageType] = useState("error")

	function updateLoginField(field, value) {
		setLoginForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setLoginStatus("idle")
		setLoginMessage("")
	}

	function finishResetPassword(payload) {
		setLoginForm({
			email: payload.email,
			password: "",
		})
		setLoginStatus(payload.status)
		setLoginMessage(payload.message)
		setLoginMessageType(payload.messageType)
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

	if (authMode === "resetPassword") {
		return <ResetPasswordPage onFinish={finishResetPassword} goBack={() => setAuthMode("login")} />
	}

	return (
		<div className="app loginPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			<form className="loginForm" method="post" action="/login" onSubmit={submitLogin}>
				<h1>Login</h1>
				<InputBox
					id="login-email"
					name="email"
					fieldClassName="loginField"
					label="Email"
					type="email"
					value={loginForm.email}
					onChange={(value) => updateLoginField("email", value)}
					autoComplete="username"
				/>
				<InputBox
					id="login-password"
					name="password"
					fieldClassName="loginField"
					label="Password"
					value={loginForm.password}
					onChange={(value) => updateLoginField("password", value)}
					autoComplete="current-password"
					isPassword
				/>
				<button type="submit" className="loginSubmitButton" disabled={loginStatus === "submitting"}>
					{loginStatus === "submitting" ? "Logging in..." : "Login"}
				</button>
				<button
					type="button"
					className="authTextButton"
					onClick={() => setAuthMode("resetPassword")}
				>
					Forgot password?
				</button>
				{loginMessage && (
					<p className={`loginMessage loginMessage${loginMessageType}`}>{loginMessage}</p>
				)}
				<p className="authSwitchText">
					Don't have an account? <Link to="/signup">Sign up</Link>
				</p>
			</form>
		</div>
	)
}
