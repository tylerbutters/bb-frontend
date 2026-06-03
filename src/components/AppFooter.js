import { Link } from "react-router-dom"
import "./AppFooter.css"

export default function AppFooter() {
	return (
		<footer className="appFooter" aria-label="Legal">
			<Link to="/terms">Terms</Link>
			<Link to="/privacy">Privacy</Link>
		</footer>
	)
}
