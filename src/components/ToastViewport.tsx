import { useCallback, useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import {
	API_ERROR_TOAST_DURATION_MS,
	subscribeToApiErrorToasts,
} from "../api/apiErrorToasts"
import "./ToastViewport.css"

const MAX_VISIBLE_TOASTS = 3
const TOAST_EXIT_ANIMATION_MS = 180

export default function ToastViewport() {
	const [toasts, setToasts] = useState([])
	const dismissTimersRef = useRef(new Map())
	const removeTimersRef = useRef(new Map())

	const dismissToast = useCallback((toastId) => {
		const dismissTimerId = dismissTimersRef.current.get(toastId)
		if (dismissTimerId) {
			window.clearTimeout(dismissTimerId)
			dismissTimersRef.current.delete(toastId)
		}
		if (removeTimersRef.current.has(toastId)) return

		setToasts((currentToasts) =>
			currentToasts.map((toast) =>
				toast.id === toastId ? { ...toast, isExiting: true } : toast,
			),
		)

		const removeTimerId = window.setTimeout(() => {
			removeTimersRef.current.delete(toastId)
			setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId))
		}, TOAST_EXIT_ANIMATION_MS)

		removeTimersRef.current.set(toastId, removeTimerId)
	}, [])

	useEffect(() => {
		const dismissTimers = dismissTimersRef.current
		const removeTimers = removeTimersRef.current
		const unsubscribe = subscribeToApiErrorToasts((toast) => {
			const timerId = window.setTimeout(
				() => dismissToast(toast.id),
				API_ERROR_TOAST_DURATION_MS,
			)
			dismissTimers.set(toast.id, timerId)

			setToasts((currentToasts) =>
				[
					toast,
					...currentToasts.filter(
						(currentToast) =>
							currentToast.type !== toast.type || currentToast.message !== toast.message,
					),
				].slice(0, MAX_VISIBLE_TOASTS),
			)
		})

		return () => {
			unsubscribe()
			for (const timerId of dismissTimers.values()) {
				window.clearTimeout(timerId)
			}
			for (const timerId of removeTimers.values()) {
				window.clearTimeout(timerId)
			}
			dismissTimers.clear()
			removeTimers.clear()
		}
	}, [dismissToast])

	if (toasts.length === 0) return null

	return (
		<div className="toastViewport" aria-live="assertive" aria-atomic="true">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`appToast appToast-${toast.type} ${
						toast.isExiting ? "appToastExiting" : ""
					}`}
					role="alert"
				>
					<span className="appToastMessage">{toast.message}</span>
					<button
						type="button"
						className="appToastDismissButton"
						aria-label="Dismiss notification"
						onClick={() => dismissToast(toast.id)}
					>
						<X size={16} aria-hidden="true" />
					</button>
				</div>
			))}
		</div>
	)
}
