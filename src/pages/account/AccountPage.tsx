import { useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import type { User } from "../../api/types"
import "../auth/AuthPage.css"
import "./AccountPage.css"
import EmailSection from "./EmailSection"
import PasswordSection from "./PasswordSection"
import DeleteAccountSection from "./DeleteAccountSection"
import AccountSectionHeader from "./AccountSectionHeader"

interface AccountPageProps {
	currentUser?: User | null
	onAccountDelete: () => void
	onLogout: () => void
	onUserUpdate: (user: User) => void
}

interface AccountRouteState {
	status?: string
	messageType?: string
	message?: string
}

export default function AccountPage({
	currentUser,
	onAccountDelete,
	onLogout,
	onUserUpdate,
}: AccountPageProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const routeState = location.state as AccountRouteState | null

	const [resetMessage, setResetMessage] = useState<AccountRouteState | null>(null)

	useEffect(() => {
		if (!routeState) return

		if (routeState.status && routeState.message) {
			setResetMessage({
				status: routeState.status,
				messageType: routeState.messageType,
				message: routeState.message,
			})
		}

		navigate(location.pathname, {
			replace: true,
			state: null,
		})
	}, [location.pathname, navigate, routeState])

	if (!currentUser) {
		return <Navigate to="/login" replace />
	}

	return (
		<div className="app accountPage">
			<main className="accountContent accountPageContent" aria-labelledby="account-heading">
				<h1 id="account-heading">Account</h1>

				<EmailSection currentUser={currentUser} onUserUpdate={onUserUpdate} />
				<PasswordSection
					currentUser={currentUser}
					onUserUpdate={onUserUpdate}
					resetMessage={resetMessage}
				/>

				<section
					className="accountSection accountSessionSection"
					aria-labelledby="account-session-heading"
				>
					<AccountSectionHeader headingId="account-session-heading" icon={LogOut} title="Session" />
					<div className="accountSessionActions">
						<button type="button" className="logoutButton" onClick={onLogout}>
							Log out
						</button>
					</div>
				</section>
				<DeleteAccountSection currentUser={currentUser} onAccountDelete={onAccountDelete} />
			</main>
		</div>
	)
}
