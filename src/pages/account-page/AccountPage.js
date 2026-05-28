import { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import "../AuthPage.css"
import "./AccountPage.css"
import DisplayNameSection from "./DisplayNameSection"
import EmailSection from "./EmailSection"
import PasswordSection from "./PasswordSection"
import DeleteAccountSection from "./DeleteAccountSection"

export default function AccountPage({ currentUser, onAccountDelete, onLogout, onUserUpdate }) {
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
			<main className="accountContent accountPageContent" aria-labelledby="account-heading">
				<h1 id="account-heading">Account</h1>

				<div className="accountGrid">
					<div className="accountGridColumn">
						<DisplayNameSection currentUser={currentUser} onUserUpdate={onUserUpdate} />
						<EmailSection currentUser={currentUser} onUserUpdate={onUserUpdate} />
						<DeleteAccountSection currentUser={currentUser} onAccountDelete={onAccountDelete} />
					</div>

					<div className="accountGridColumn">
						<PasswordSection
							currentUser={currentUser}
							onUserUpdate={onUserUpdate}
							resetMessage={resetMessage}
						/>

						<button type="button" className="logoutButton" onClick={onLogout}>
							Log out
						</button>
					</div>
				</div>
			</main>
		</div>
	)
}
