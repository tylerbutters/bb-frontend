import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AccountPage from "./pages/account/AccountPage"
import AboutPage from "./pages/about/AboutPage"
import SentenceBuilderPage from "./pages/sentence-builder/SentenceBuilderPage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ConfirmEmailChangePage from "./pages/auth/ConfirmEmailChangePage"
import SuggestionsPage from "./pages/suggestions/SuggestionsPage"
import StatsPage from "./pages/stats/StatsPage"
import AdminPage from "./pages/admin/AdminPage"
import AppNavbar from "./components/AppNavbar"
import AppFooter from "./components/AppFooter"
import LegalDocumentPage from "./pages/legal/LegalDocumentPage"
import { logout } from "./api/auth"
import type { User } from "./api/types"
import ToastViewport from "./components/ToastViewport"

const CURRENT_USER_STORAGE_KEY = "bbCurrentUser"

function readStoredUser(): User | null {
	try {
		const storedUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY)
		return storedUser ? (JSON.parse(storedUser) as User) : null
	} catch {
		return null
	}
}

export default function App() {
	const [currentUser, setCurrentUser] = useState(readStoredUser)

	function handleLogin(user: User) {
		setCurrentUser(user)
		window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
	}

	function handleUserUpdate(user: User) {
		setCurrentUser(user)
		window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
	}

	function clearCurrentUser() {
		setCurrentUser(null)
		window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
	}

	function handleLogout() {
		clearCurrentUser()
		logout().catch(() => {})
	}

	return (
		<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
			<ToastViewport />
			<AppNavbar currentUser={currentUser} />
			<Routes>
				<Route
					path="/"
					element={
						<SentenceBuilderPage
							currentUser={currentUser}
							onAuthExpired={clearCurrentUser}
						/>
					}
				/>
				<Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
				<Route path="/signup" element={<SignupPage onSignup={handleLogin} />} />
				<Route path="/about" element={<AboutPage />} />
				<Route path="/suggestions" element={<SuggestionsPage />} />
				<Route path="/terms" element={<LegalDocumentPage documentKey="terms" />} />
				<Route path="/privacy" element={<LegalDocumentPage documentKey="privacy" />} />
				{/* TODO(premium): Re-enable when checkout launches: <Route path="/buy" element={<BuyPage />} /> */}
				<Route
					path="/account"
					element={
						<AccountPage
							currentUser={currentUser}
							onAccountDelete={handleLogout}
							onLogout={handleLogout}
							onUserUpdate={handleUserUpdate}
						/>
					}
				/>
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />
				<Route
					path="/stats"
					element={
						<StatsPage
							currentUser={currentUser}
							onAuthExpired={clearCurrentUser}
						/>
					}
				/>
				<Route
					path="/admin"
					element={
						<AdminPage
							currentUser={currentUser}
							onAuthExpired={clearCurrentUser}
						/>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			<AppFooter />
		</BrowserRouter>
	)
}
