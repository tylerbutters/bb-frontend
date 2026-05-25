import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { deleteUser, updateUser } from "../api/users"

export default function AccountPage({ currentUser, onAccountDelete, onUserUpdate }) {
	const [accountForm, setAccountForm] = useState({
		displayName: currentUser?.displayName || "",
		email: currentUser?.email || "",
		password: "",
	})
	const [accountStatus, setAccountStatus] = useState("idle")
	const [accountMessage, setAccountMessage] = useState("")
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
		setAccountStatus("idle")
		setAccountMessage("")
	}

	function cancelDeleteAccount() {
		setIsDeleteConfirming(false)
		setDeleteStatus("idle")
		setDeleteMessage("")
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
			const data = await updateUser(currentUser.id, payload)
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
			setAccountMessage(error.message || "Account update failed.")
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
		</div>
	)
}
