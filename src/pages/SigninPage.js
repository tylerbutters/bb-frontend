import { useState } from "react"
import { Link } from "react-router-dom"

export default function SigninPage() {
	const [signinForm, setSigninForm] = useState({
		email: "",
		password: "",
	})

	function updateSigninField(field, value) {
		setSigninForm((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	function submitSignin(e) {
		e.preventDefault()
	}

	return (
		<div className="app signupPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			<form className="signupForm" onSubmit={submitSignin}>
				<h1>Sign in</h1>
				<label className="signupField">
					<span>Email</span>
					<input
						type="email"
						value={signinForm.email}
						onChange={(e) => updateSigninField("email", e.target.value)}
						autoComplete="email"
						required
					/>
				</label>
				<label className="signupField">
					<span>Password</span>
					<input
						type="password"
						value={signinForm.password}
						onChange={(e) => updateSigninField("password", e.target.value)}
						autoComplete="current-password"
						required
					/>
				</label>
				<button type="submit" className="signupSubmitButton">
					Sign in
				</button>
				<p className="authSwitchText">
					Don't have an account? <Link to="/signup">Sign up</Link>
				</p>
			</form>
		</div>
	)
}
