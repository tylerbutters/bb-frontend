import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { login } from "../api/auth"
import InputBox from "../components/InputBox"
import "./AuthPage.css"

export default function LoginPage({ onLogin }) {
	const navigate = useNavigate()
	const location = useLocation()

	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	})
	const [loginStatus, setLoginStatus] = useState("idle")
	const [loginMessage, setLoginMessage] = useState("")
	const [loginMessageType, setLoginMessageType] = useState("error")

	useEffect(() => {
		if (!location.state) return
		finishResetPassword(location.state)
	}, [location.state])

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

	return (
		<div className="app loginPage">
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
				<Link to="/forgot-password" className="authTextButton">
					Forgot password?
				</Link>
				<button type="submit" className="authPrimaryButton" disabled={loginStatus === "submitting"}>
					{loginStatus === "submitting" ? "Logging in..." : "Login"}
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
