import { Link, useLocation } from "react-router-dom"
import "./AppNavbar.css"

export default function AppNavbar({ currentUser }) {
	const location = useLocation()
	const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"

	return (
		<header className="appNavbar">
			<nav className="appNavbarLeftActions" aria-label="Site">
				<Link className="appNavbarLogo" to="/">
					Bunsho Builder
				</Link>
				<Link className="appNavbarLink appNavbarAboutLink" to="/about">
					About
				</Link>
				{/* TODO(premium): Re-enable the premium nav link when premium is live.
				{currentUser?.plan !== "premium" && (
					<Link className="appNavbarLink appNavbarPremiumLink" to="/buy">
						PREMIUM
					</Link>
				)}
				*/}
			</nav>
			{currentUser && (
				<nav className="appNavbarRightActions" aria-label="Account">
					<Link className="appNavbarLink" to="/stats">
						Stats
					</Link>
					<Link className="appNavbarLink" to="/account">
						Account
					</Link>
				</nav>
			)}
			{!currentUser && !isAuthPage && (
				<nav className="appNavbarRightActions" aria-label="Account">
					<Link className="appNavbarLink" to="/login">
						Login
					</Link>
					<Link className="appNavbarLink appNavbarSignupLink" to="/signup">
						Sign up
					</Link>
				</nav>
			)}
		</header>
	)
}
