import { useState } from "react"
import { Navigate } from "react-router-dom"
import { Trash2, X } from "lucide-react"
import { deleteUser } from "../../api/users"
import "../AuthPage.css"
import AccountSectionHeader from "./AccountSectionHeader"

export default function DeleteAccountSection({ currentUser, onAccountDelete }) {
	const [isDeleteConfirming, setIsDeleteConfirming] = useState(false)
	const [isAccountDeleted, setIsAccountDeleted] = useState(false)
	const [deleteStatus, setDeleteStatus] = useState("idle")
	const [deleteMessage, setDeleteMessage] = useState("")

	if (isAccountDeleted) {
		return <Navigate to="/" replace />
	}

	function cancelDeleteAccount() {
		setIsDeleteConfirming(false)
		setDeleteStatus("idle")
		setDeleteMessage("")
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
		<section
			className="accountSection accountDangerSection"
			aria-labelledby="delete-account-settings-heading"
		>
			<AccountSectionHeader
				headingId="delete-account-settings-heading"
				icon={Trash2}
				title="Delete account"
			/>

			{isDeleteConfirming && (
				<p className="accountDangerNotice">This action cannot be undone.</p>
			)}

			<div className="deleteAccountActions">
				<button
					type="button"
					className="deleteAccountButton"
					disabled={deleteStatus === "submitting"}
					onClick={deleteAccount}
				>
					<Trash2 className="accountButtonIcon" size={16} aria-hidden="true" />
					<span>
						{deleteStatus === "submitting"
							? "Deleting..."
							: isDeleteConfirming
								? "Confirm delete"
								: "Delete account"}
					</span>
				</button>

				{isDeleteConfirming && (
					<button type="button" className="cancelDeleteButton" onClick={cancelDeleteAccount}>
						<X className="accountButtonIcon" size={16} aria-hidden="true" />
						<span>Cancel</span>
					</button>
				)}
			</div>

			{deleteMessage && (
				<p className="accountMessage accountMessageerror">{deleteMessage}</p>
			)}
		</section>
	)
}
