import { useEffect, useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { deleteUser, updateUser } from "../../api/users"
import InputBox from "../../components/InputBox"
import "../TopRightButton.css"
import "../AuthPage.css"

export default function EmailSection({ currentUser, onUserUpdate }) {
	const [email, setEmail] = useState(currentUser?.email || "")
	const [feedback, setFeedback] = useState({
		status: "idle",
		message: "",
	})

	useEffect(() => {
		setEmail(currentUser?.email || "")
	}, [currentUser?.email])

	async function submitEmail(e) {
		e.preventDefault()

		setFeedback({
			status: "submitting",
			message: "",
		})

		try {
			const data = await updateUser(currentUser.id, { email })

			onUserUpdate(data.user)

			setEmail(data.user.email || "")

			setFeedback({
				status: "success",
				message: data.message || "Email updated.",
			})
		} catch (error) {
			setFeedback({
				status: "error",
				message: error.message || "Email update failed.",
			})
		}
	}

	function updateEmail(value) {
		setEmail(value)
		setFeedback({
			status: "idle",
			message: "",
		})
	}

	return (
		<form className="accountSection" aria-label="Email settings" onSubmit={submitEmail}>
			<h2>Email</h2>

			<InputBox
				id="account-email"
				fieldClassName="accountField"
				label="Email"
				type="email"
				value={email}
				onChange={updateEmail}
				autoComplete="email"
			/>

			<button
				type="submit"
				className="accountSubmitButton"
				disabled={feedback.status === "submitting"}
			>
				{feedback.status === "submitting" ? "Saving..." : "Save changes"}
			</button>

			{feedback.message && (
				<p className={`accountMessage accountMessage${feedback.status}`}>{feedback.message}</p>
			)}
		</form>
	)
}
