import { Link } from "react-router-dom"
import AccountMenu from "./AccountMenu"
import "../pages/TopRightButton.css"

export default function AppNavbar({ currentUser, onLogout }) {
	return (
		<header className="appNavbar">
			<nav className="topLeftActions" aria-label="Site">
				<Link className="topLeftLogo" to="/">
					Bunsho Builder
				</Link>
				<Link className="topRightButton topLeftButton" to="/about">
					About
				</Link>
			</nav>
			<AccountMenu currentUser={currentUser} onLogout={onLogout} />
		</header>
	)
}
