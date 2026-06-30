import { useState } from "react"
import { Navigate } from "react-router-dom"
import { Trash2 } from "lucide-react"
import { getErrorMessage } from "../../api/errors"
import { deleteUser } from "../../api/users"
import type { User } from "../../api/types"
import "../auth/AuthPage.css"
import AccountSectionHeader from "./AccountSectionHeader"

interface DeleteAccountSectionProps {
	currentUser: User
	onAccountDelete: () => void
}

export default function DeleteAccountSection({
	currentUser,
	onAccountDelete,
}: DeleteAccountSectionProps) {
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
			setDeleteMessage(getErrorMessage(error, "Account delete failed."))
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

			{isDeleteConfirming && <p className="accountDangerNotice">This action cannot be undone.</p>}

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

			{deleteMessage && <p className="accountMessage accountMessageerror">{deleteMessage}</p>}
		</section>
	)
}
