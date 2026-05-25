import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createUser } from "../api/users"

export default function SignupPage({ onSignup }) {
	const navigate = useNavigate()
	const [signupForm, setSignupForm] = useState({
		email: "",
		password: "",
		displayName: "",
	})
	const [signupStatus, setSignupStatus] = useState("idle")
	const [signupMessage, setSignupMessage] = useState("")
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	function updateSignupField(field, value) {
		setSignupForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setSignupStatus("idle")
		setSignupMessage("")
	}

	async function submitSignup(e) {
		e.preventDefault()
		setSignupStatus("submitting")
		setSignupMessage("")

		try {
			const user = await createUser(signupForm)
			onSignup(user)
			navigate("/")
		} catch (error) {
			setSignupStatus("error")
			setSignupMessage(error.message || "Sign up failed.")
		}
	}

	return (
		<div className="app signupPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			<form className="signupForm" method="post" action="/users/" onSubmit={submitSignup}>
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
				<button
					type="submit"
					className="signupSubmitButton"
					disabled={signupStatus === "submitting"}
				>
					{signupStatus === "submitting" ? "Creating..." : "Create account"}
				</button>
				{signupMessage && (
					<p className={`signupMessage signupMessage${signupStatus}`}>{signupMessage}</p>
				)}
				<p className="authSwitchText">
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</div>
	)
}
