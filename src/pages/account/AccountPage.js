import { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import "../auth/AuthPage.css"
import "./AccountPage.css"
import DisplayNameSection from "./DisplayNameSection"
import EmailSection from "./EmailSection"
import PasswordSection from "./PasswordSection"
import DeleteAccountSection from "./DeleteAccountSection"
import AccountSectionHeader from "./AccountSectionHeader"

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

						<section
							className="accountSection accountSessionSection"
							aria-labelledby="account-session-heading"
						>
							<AccountSectionHeader
								headingId="account-session-heading"
								icon={LogOut}
								title="Session"
							/>
							<div className="accountSessionActions">
								<button type="button" className="logoutButton" onClick={onLogout}>
									<LogOut className="accountButtonIcon" size={16} aria-hidden="true" />
									<span>Log out</span>
								</button>
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}
