import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AccountPage from "./pages/account-page/AccountPage"
import AboutPage from "./pages/AboutPage"
import SentenceBuilderPage from "./pages/sentence-builder-page/SentenceBuilderPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ConfirmEmailChangePage from "./pages/ConfirmEmailChangePage"

const CURRENT_USER_STORAGE_KEY = "jsbCurrentUser"

function readStoredUser() {
	try {
		return JSON.parse(window.localStorage.getItem(CURRENT_USER_STORAGE_KEY))
	} catch {
		return null
	}
}

export default function App() {
	const [currentUser, setCurrentUser] = useState(readStoredUser)

	function handleLogin(user) {
		setCurrentUser(user)
		window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
	}

	function handleUserUpdate(user) {
		setCurrentUser(user)
		window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
	}

	function handleLogout() {
		setCurrentUser(null)
		window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
	}

	return (
		<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
			<Routes>
				<Route
					path="/"
					element={<SentenceBuilderPage currentUser={currentUser} onLogout={handleLogout} />}
				/>
				<Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
				<Route path="/signup" element={<SignupPage onSignup={handleLogin} />} />
				<Route path="/about" element={<AboutPage />} />
				<Route
					path="/account"
					element={
						<AccountPage
							currentUser={currentUser}
							onAccountDelete={handleLogout}
							onUserUpdate={handleUserUpdate}
						/>
					}
				/>
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
