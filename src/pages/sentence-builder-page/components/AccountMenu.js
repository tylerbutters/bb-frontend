import { useState } from "react"
import { Link } from "react-router-dom"
import "../../TopRightButton.css"
import "./AccountMenu.css"

export default function AccountMenu({ currentUser, onLogout }) {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

	function logout() {
		setIsUserMenuOpen(false)
		onLogout()
	}

	if (!currentUser) {
		return (
			<nav className="topRightActions" aria-label="Account">
				<Link className="topRightButton" to="/login">
					Login
				</Link>
				<Link className="topRightButton topRightSignupButton" to="/signup">
					Sign up
				</Link>
			</nav>
		)
	}

	return (
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
	)
}
