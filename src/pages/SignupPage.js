import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function SignupPage({ onSignup }) {
	const navigate = useNavigate()
	const [signupForm, setSignupForm] = useState({
		email: "",
		password: "",
		displayName: "",
	})
	const [signupStatus, setSignupStatus] = useState("idle")
	const [signupMessage, setSignupMessage] = useState("")

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
			const response = await fetch("/api/v1/users/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(signupForm),
			})
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data?.error?.message || data?.message || "Sign up failed.")
			}

			onSignup(data.user)
			navigate("/")
		} catch (error) {
			setSignupStatus("error")
			setSignupMessage(error.message)
		}
	}

	return (
		<div className="app signupPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			<form className="signupForm" onSubmit={submitSignup}>
				<h1>Sign up</h1>
				<label className="signupField">
					<span>Display name</span>
					<input
						type="text"
						value={signupForm.displayName}
						onChange={(e) => updateSignupField("displayName", e.target.value)}
						autoComplete="name"
						required
					/>
				</label>
				<label className="signupField">
					<span>Email</span>
					<input
						type="email"
						value={signupForm.email}
						onChange={(e) => updateSignupField("email", e.target.value)}
						autoComplete="email"
						required
					/>
				</label>
				<label className="signupField">
					<span>Password</span>
					<input
						type="password"
						value={signupForm.password}
						onChange={(e) => updateSignupField("password", e.target.value)}
						autoComplete="new-password"
						minLength={8}
						required
					/>
				</label>
				<button type="submit" className="signupSubmitButton" disabled={signupStatus === "submitting"}>
					{signupStatus === "submitting" ? "Creating..." : "Create account"}
				</button>
				{signupMessage && (
					<p className={`signupMessage signupMessage${signupStatus}`}>{signupMessage}</p>
				)}
				<p className="authSwitchText">
					Already have an account? <Link to="/login">Sign in</Link>
				</p>
			</form>
		</div>
	)
}
