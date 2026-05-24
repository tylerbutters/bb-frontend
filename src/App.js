import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import AccountPage from "./pages/AccountPage"
import SentenceBuilderPage from "./pages/SentenceBuilderPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"

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
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
