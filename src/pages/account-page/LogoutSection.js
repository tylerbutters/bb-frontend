export default function LogoutSection({ onLogout }) {
	return (
		<section className="accountSection" aria-label="Login session">
			<h2>Session</h2>
			<button type="button" className="accountLogoutButton" onClick={onLogout}>
				Log out
			</button>
		</section>
	)
}
