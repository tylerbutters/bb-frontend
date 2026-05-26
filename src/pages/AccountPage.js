import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { deleteUser, updateUser } from "../api/users"
import "./TopRightButton.css"
import "./AuthPage.css"

export default function AccountPage({ currentUser, onAccountDelete, onUserUpdate }) {
	const [accountForm, setAccountForm] = useState({
		displayName: currentUser?.displayName || "",
		email: currentUser?.email || "",
		password: "",
	})
	const [accountFeedback, setAccountFeedback] = useState({
		displayName: { status: "idle", message: "" },
		email: { status: "idle", message: "" },
		password: { status: "idle", message: "" },
	})
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [isDeleteConfirming, setIsDeleteConfirming] = useState(false)
	const [isAccountDeleted, setIsAccountDeleted] = useState(false)
	const [deleteStatus, setDeleteStatus] = useState("idle")
	const [deleteMessage, setDeleteMessage] = useState("")

	if (isAccountDeleted) {
		return <Navigate to="/" replace />
	}

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	function updateAccountField(field, value) {
		setAccountForm((prev) => ({
			...prev,
			[field]: value,
		}))
		setAccountFeedback((prev) => ({
			...prev,
			[field]: { status: "idle", message: "" },
		}))
	}

	function cancelDeleteAccount() {
		setIsDeleteConfirming(false)
		setDeleteStatus("idle")
		setDeleteMessage("")
	}

	async function submitAccountSection(e, field) {
		e.preventDefault()
		setAccountFeedback((prev) => ({
			...prev,
			[field]: { status: "submitting", message: "" },
		}))

		try {
			const data = await updateUser(currentUser.id, { [field]: accountForm[field] })
			onUserUpdate(data.user)
			setAccountForm((prev) => ({
				...prev,
				displayName: data.user.displayName || "",
				email: data.user.email || "",
				password: field === "password" ? "" : prev.password,
			}))
			setAccountFeedback((prev) => ({
				...prev,
				[field]: { status: "success", message: data.message || "Account updated." },
			}))
		} catch (error) {
			setAccountFeedback((prev) => ({
				...prev,
				[field]: { status: "error", message: error.message || "Account update failed." },
			}))
		}
	}

	async function deleteAccount() {
		if (!isDeleteConfirming) {
			setIsDeleteConfirming(true)
			setDeleteStatus("idle")
			setDeleteMessage("")
			return
		}

		setDeleteStatus("submitting")
		setDeleteMessage("")

		try {
			await deleteUser(currentUser.id)
			setIsAccountDeleted(true)
			onAccountDelete()
		} catch (error) {
			setDeleteStatus("error")
			setDeleteMessage(error.message || "Account delete failed.")
		}
	}

	return (
		<div className="app accountPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>
			<main className="accountContent" aria-labelledby="account-heading">
				<h1 id="account-heading">Account</h1>
				<form
					className="accountSection"
					aria-label="Display name settings"
					onSubmit={(e) => submitAccountSection(e, "displayName")}
				>
					<h2>Display name</h2>
					<label className="accountField" htmlFor="account-display-name">
						<span>Display name</span>
						<input
							id="account-display-name"
							type="text"
							value={accountForm.displayName}
							onChange={(e) => updateAccountField("displayName", e.target.value)}
							autoComplete="name"
						/>
					</label>
					<button
						type="submit"
						className="accountSubmitButton"
						disabled={accountFeedback.displayName.status === "submitting"}
					>
						{accountFeedback.displayName.status === "submitting" ? "Saving..." : "Save changes"}
					</button>
					{accountFeedback.displayName.message && (
						<p
							className={`accountMessage accountMessage${accountFeedback.displayName.status}`}
						>
							{accountFeedback.displayName.message}
						</p>
					)}
				</form>
				<form
					className="accountSection"
					aria-label="Email settings"
					onSubmit={(e) => submitAccountSection(e, "email")}
				>
					<h2>Email</h2>
					<label className="accountField" htmlFor="account-email">
						<span>Email</span>
						<input
							id="account-email"
							type="email"
							value={accountForm.email}
							onChange={(e) => updateAccountField("email", e.target.value)}
							autoComplete="email"
						/>
					</label>
					<button
						type="submit"
						className="accountSubmitButton"
						disabled={accountFeedback.email.status === "submitting"}
					>
						{accountFeedback.email.status === "submitting" ? "Saving..." : "Save changes"}
					</button>
					{accountFeedback.email.message && (
						<p className={`accountMessage accountMessage${accountFeedback.email.status}`}>
							{accountFeedback.email.message}
						</p>
					)}
				</form>
				<form
					className="accountSection"
					aria-label="Password settings"
					onSubmit={(e) => submitAccountSection(e, "password")}
				>
					<h2>Password</h2>
					<label className="accountField" htmlFor="account-password">
						<span>New password</span>
						<div className="passwordInputWrap">
							<input
								id="account-password"
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
						disabled={accountFeedback.password.status === "submitting"}
					>
						{accountFeedback.password.status === "submitting" ? "Saving..." : "Save changes"}
					</button>
					{accountFeedback.password.message && (
						<p className={`accountMessage accountMessage${accountFeedback.password.status}`}>
							{accountFeedback.password.message}
						</p>
					)}
				</form>
				<div className="deleteAccountPanel">
					<h2>Delete account</h2>
					<div className="deleteAccountActions">
						<button
							type="button"
							className="deleteAccountButton"
							disabled={deleteStatus === "submitting"}
							onClick={deleteAccount}
						>
							{deleteStatus === "submitting"
								? "Deleting..."
								: isDeleteConfirming
									? "Confirm delete"
									: "Delete account"}
						</button>
						{isDeleteConfirming && (
							<button type="button" className="cancelDeleteButton" onClick={cancelDeleteAccount}>
								Cancel
							</button>
						)}
					</div>
					{deleteMessage && (
						<p className={`accountMessage accountMessage${deleteStatus}`}>{deleteMessage}</p>
					)}
				</div>
			</main>
		</div>
	)
}
