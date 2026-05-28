import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { confirmEmailChange } from "../api/users"
import "./AuthPage.css"

export default function ConfirmEmailChangePage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const hasConfirmedRef = useRef(false)

	const token = searchParams.get("token")

	const [feedback, setFeedback] = useState({
		status: "submitting",
		message: "Confirming email change...",
	})

	useEffect(() => {
		if (hasConfirmedRef.current) return
		hasConfirmedRef.current = true

		if (!token) {
			setFeedback({
				status: "error",
				message: "Invalid email change link.",
			})
			return
		}

		// Remove the token from the URL immediately after reading it.
		navigate("/confirm-email-change", {
			replace: true,
		})

		async function confirmChange() {
			try {
				const response = await confirmEmailChange({ token })

				navigate("/account", {
					replace: true,
					state: {
						emailState: {
							email: response.user.email,
							status: "success",
							messageType: "success",
							message: "Email updated successfully. Please log in with your new email.",
						},
					},
				})
			} catch (error) {
				setFeedback({
					status: "error",
					message: error.message || "Email change link is invalid or expired.",
				})
			}
		}

		confirmChange()
	}, [token, navigate])

	return (
		<div className="app loginPage">
			<div className="loginForm">
				<h1>Confirm Email Change</h1>

				<p className={`loginMessage loginMessage${feedback.status}`}>{feedback.message}</p>

				{feedback.status === "error" && (
					<Link to="/account" className="loginSubmitButton">
						Back to account
					</Link>
				)}
			</div>
		</div>
	)
}
