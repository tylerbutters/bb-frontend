import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import "../pages/TopRightButton.css"
import "./AccountMenu.css"

export default function AccountMenu({ currentUser, onLogout }) {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const location = useLocation()
	const isAuthPage = location.pathname === "/login" || location.pathname === "/signup"

	function logout() {
		setIsUserMenuOpen(false)
		onLogout()
	}

	if (!currentUser) {
		return (
			<nav className="topRightActions" aria-label="Account">
				<Link className="topRightButton topRightPremiumButton" to="/buy">
					Buy premium
				</Link>
				{!isAuthPage && (
					<>
						<Link className="topRightButton" to="/login">
							Login
						</Link>
						<Link className="topRightButton topRightSignupButton" to="/signup">
							Sign up
						</Link>
					</>
				)}
			</nav>
		)
	}

	return (
		<nav className="topRightActions" aria-label="Account">
			<Link className="topRightButton" to="/stats">
				Stats
			</Link>
			{currentUser.plan !== "premium" && (
				<Link className="topRightButton topRightPremiumButton" to="/buy">
					Buy premium
				</Link>
			)}
			<div className="topRightUserMenu">
				<button
					type="button"
					className="topRightUserButton"
					aria-expanded={isUserMenuOpen}
					onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
				>
					{currentUser.displayName}
				</button>
				{isUserMenuOpen && (
					<div className="userDropdown" role="menu">
						<Link to="/account" role="menuitem">
							Account
						</Link>
						<button type="button" role="menuitem" onClick={logout}>
							Log out
						</button>
					</div>
				)}
			</div>
		</nav>
	)
}
