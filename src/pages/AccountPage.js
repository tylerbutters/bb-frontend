import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { deleteUser, updateUser } from "../api/users"
import InputBox from "../components/InputBox"
import "./TopRightButton.css"
import "./AuthPage.css"

export default function AccountPage({ currentUser, onAccountDelete, onUserUpdate }) {
	const [accountForm, setAccountForm] = useState({
		displayName: currentUser?.displayName || "",
		email: currentUser?.email || "",
		currentPassword: "",
		password: "",
		confirmPassword: "",
	})
	const [accountFeedback, setAccountFeedback] = useState({
		displayName: { status: "idle", message: "" },
		email: { status: "idle", message: "" },
		password: { status: "idle", message: "" },
	})
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
		const feedbackField =
			field === "currentPassword" || field === "confirmPassword" ? "password" : field
		setAccountFeedback((prev) => ({
			...prev,
			[feedbackField]: { status: "idle", message: "" },
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

		let payload = { [field]: accountForm[field] }
		if (field === "password") {
			payload = {
				currentPassword: accountForm.currentPassword,
				password: accountForm.password,
				confirmPassword: accountForm.confirmPassword,
			}
		}

		try {
			const data = await updateUser(currentUser.id, payload)
			onUserUpdate(data.user)
			setAccountForm((prev) => ({
				...prev,
				displayName: data.user.displayName || "",
				email: data.user.email || "",
				currentPassword: field === "password" ? "" : prev.currentPassword,
				password: field === "password" ? "" : prev.password,
				confirmPassword: field === "password" ? "" : prev.confirmPassword,
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
					<InputBox
						id="account-display-name"
						fieldClassName="accountField"
						label="Display name"
						value={accountForm.displayName}
						onChange={(value) => updateAccountField("displayName", value)}
						autoComplete="name"
					/>
					<button
						type="submit"
						className="accountSubmitButton"
						disabled={accountFeedback.displayName.status === "submitting"}
					>
						{accountFeedback.displayName.status === "submitting" ? "Saving..." : "Save changes"}
					</button>
					{accountFeedback.displayName.message && (
						<p className={`accountMessage accountMessage${accountFeedback.displayName.status}`}>
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
					<InputBox
						id="account-email"
						fieldClassName="accountField"
						label="Email"
						type="email"
						value={accountForm.email}
						onChange={(value) => updateAccountField("email", value)}
						autoComplete="email"
					/>
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
					<InputBox
						id="account-current-password"
						fieldClassName="accountField"
						label="Current password"
						value={accountForm.currentPassword}
						onChange={(value) => updateAccountField("currentPassword", value)}
						autoComplete="current-password"
						isPassword
						required
					/>
					<InputBox
						id="account-password"
						fieldClassName="accountField"
						label="New password"
						value={accountForm.password}
						onChange={(value) => updateAccountField("password", value)}
						autoComplete="new-password"
						isPassword
						required
					/>
					<InputBox
						id="account-password-confirmation"
						fieldClassName="accountField"
						label="Confirm new password"
						value={accountForm.confirmPassword}
						onChange={(value) => updateAccountField("confirmPassword", value)}
						autoComplete="new-password"
						isPassword
						required
					/>
					<button type="button" className="authTextButton">
						Forgot password?
					</button>
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
