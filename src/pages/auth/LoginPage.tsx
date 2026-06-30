import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { getErrorMessage } from "../../api/errors"
import { login } from "../../api/auth"
import type { User } from "../../api/types"
import InputBox from "../../components/InputBox"
import "./AuthPage.css"

type LoginFormField = "email" | "password"

interface LoginRouteState {
	email: string
	status: string
	message: string
	messageType: string
}

interface LoginPageProps {
	onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const routeState = location.state as LoginRouteState | null

	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	})
	const [loginStatus, setLoginStatus] = useState("idle")
	const [loginMessage, setLoginMessage] = useState("")
	const [loginMessageType, setLoginMessageType] = useState("error")

	useEffect(() => {
		if (!routeState) return
		finishResetPassword(routeState)
	}, [routeState])

	function updateLoginField(field: LoginFormField, value: string) {
		setLoginForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setLoginStatus("idle")
		setLoginMessage("")
	}

	function finishResetPassword(payload: LoginRouteState) {
		setLoginForm({
			email: payload.email,
			password: "",
		})
		setLoginStatus(payload.status)
		setLoginMessage(payload.message)
		setLoginMessageType(payload.messageType)
	}

	async function submitLogin(e: FormEvent<HTMLFormElement>) {
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
			setLoginMessage(getErrorMessage(error, "Login failed."))
		}
	}

	return (
		<div className="app loginPage">
			<form className="loginForm" method="post" action="/login" onSubmit={submitLogin} noValidate>
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
