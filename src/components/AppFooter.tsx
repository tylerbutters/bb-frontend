import { Link, useLocation } from "react-router-dom"
import "./AppFooter.css"

export default function AppFooter() {
	const location = useLocation()

	if (location.pathname === "/") return null

	return (
		<footer className="appFooter" aria-label="Legal">
			<Link to="/terms">Terms</Link>
			<Link to="/privacy">Privacy</Link>
		</footer>
	)
}
