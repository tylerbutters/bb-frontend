import { useState } from "react"
import { Navigate } from "react-router-dom"
import { deleteUser } from "../../api/users"
import "../TopRightButton.css"
import "../AuthPage.css"

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
	)
}
