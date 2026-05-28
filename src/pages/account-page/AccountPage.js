import { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import "../AuthPage.css"
import DisplayNameSection from "./DisplayNameSection"
import EmailSection from "./EmailSection"
import PasswordSection from "./PasswordSection"
import DeleteAccountSection from "./DeleteAccountSection"

export default function AccountPage({ currentUser, onAccountDelete, onUserUpdate }) {
	const navigate = useNavigate()
	const location = useLocation()

	const [resetMessage, setResetMessage] = useState(null)

	useEffect(() => {
		if (!location.state) return

		if (location.state.status && location.state.message) {
			setResetMessage({
				status: location.state.status,
				messageType: location.state.messageType,
				message: location.state.message,
			})
		}

		navigate(location.pathname, {
			replace: true,
			state: null,
		})
	}, [location.state, location.pathname, navigate])

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	return (
		<div className="app accountPage">
			<main className="accountContent" aria-labelledby="account-heading">
				<h1 id="account-heading">Account</h1>

				<DisplayNameSection currentUser={currentUser} onUserUpdate={onUserUpdate} />

				<EmailSection currentUser={currentUser} onUserUpdate={onUserUpdate} />

				<PasswordSection
					currentUser={currentUser}
					onUserUpdate={onUserUpdate}
					resetMessage={resetMessage}
				/>

				<DeleteAccountSection currentUser={currentUser} onAccountDelete={onAccountDelete} />
			</main>
		</div>
	)
}
