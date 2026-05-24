import { useState } from "react"
import { Link, Navigate } from "react-router-dom"

export default function AccountPage({ currentUser, onUserUpdate }) {
	const [accountForm, setAccountForm] = useState({
		displayName: currentUser?.displayName || "",
		email: currentUser?.email || "",
		password: "",
	})
	const [accountStatus, setAccountStatus] = useState("idle")
	const [accountMessage, setAccountMessage] = useState("")
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	function updateAccountField(field, value) {
		setAccountForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setAccountStatus("idle")
		setAccountMessage("")
	}

	async function submitAccount(e) {
		e.preventDefault()
		setAccountStatus("submitting")
		setAccountMessage("")

		const payload = {
			displayName: accountForm.displayName,
			email: accountForm.email,
		}

		if (accountForm.password) {
			payload.password = accountForm.password
		}

		try {
			const response = await fetch(`/api/v1/users/${currentUser.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			})
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data?.error?.message || data?.message || "Account update failed.")
			}

			onUserUpdate(data.user)
			setAccountForm({
				displayName: data.user.displayName || "",
				email: data.user.email || "",
				password: "",
			})
			setAccountStatus("success")
			setAccountMessage(data.message || "Account updated.")
		} catch (error) {
			setAccountStatus("error")
			setAccountMessage(error.message)
		}
	}

	return (
		<div className="app accountPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			<form className="accountForm" onSubmit={submitAccount}>
				<h1>Account</h1>
				<label className="accountField">
					<span>Display name</span>
					<input
						type="text"
						value={accountForm.displayName}
						onChange={(e) => updateAccountField("displayName", e.target.value)}
						autoComplete="name"
					/>
				</label>
				<label className="accountField">
					<span>Email</span>
					<input
						type="email"
						value={accountForm.email}
						onChange={(e) => updateAccountField("email", e.target.value)}
						autoComplete="email"
					/>
				</label>
				<label className="accountField">
					<span>New password</span>
					<div className="passwordInputWrap">
						<input
							type={isPasswordVisible ? "text" : "password"}
							value={accountForm.password}
							onChange={(e) => updateAccountField("password", e.target.value)}
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
					className="accountSubmitButton"
					disabled={accountStatus === "submitting"}
				>
					{accountStatus === "submitting" ? "Saving..." : "Save changes"}
				</button>
				{accountMessage && (
					<p className={`accountMessage accountMessage${accountStatus}`}>{accountMessage}</p>
				)}
			</form>
		</div>
	)
}
