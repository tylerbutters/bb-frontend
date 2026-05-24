import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import SentenceBuilderPage from "./pages/SentenceBuilderPage"
import SigninPage from "./pages/SigninPage"
import SignupPage from "./pages/SignupPage"

export default function App() {
	return (
		<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
			<Routes>
				<Route path="/" element={<SentenceBuilderPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/signin" element={<SigninPage />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}
