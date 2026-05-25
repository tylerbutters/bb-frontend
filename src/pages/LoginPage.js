import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function LoginPage({ onLogin }) {
	const navigate = useNavigate()
	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	})
	const [loginStatus, setLoginStatus] = useState("idle")
	const [loginMessage, setLoginMessage] = useState("")
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	function updateLoginField(field, value) {
		setLoginForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setLoginStatus("idle")
		setLoginMessage("")
	}

	async function submitLogin(e) {
		e.preventDefault()
		setLoginStatus("submitting")
		setLoginMessage("")

		try {
			const response = await fetch(`${process.env.API_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(loginForm),
			})
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data?.error?.message || data?.message || "Login failed.")
			}

			onLogin(data.user)
			navigate("/")
		} catch (error) {
			setLoginStatus("error")
			setLoginMessage(error.message)
		}
	}

	return (
		<div className="app loginPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
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
				<button type="submit" className="loginSubmitButton" disabled={loginStatus === "submitting"}>
					{loginStatus === "submitting" ? "Logging in..." : "Login"}
				</button>
				{loginMessage && <p className="loginMessage loginMessageerror">{loginMessage}</p>}
				<p className="authSwitchText">
					Don't have an account? <Link to="/signup">Sign up</Link>
				</p>
			</form>
		</div>
	)
}
