export const API_ERROR_TOAST_EVENT = "bb:api-error-toast"
export const API_ERROR_TOAST_DURATION_MS = 5000

const RATE_LIMIT_ERROR_CODES = new Set([
	"RATE_LIMITED",
	"AUTH_RATE_LIMITED",
	"ACCOUNT_RECOVERY_RATE_LIMITED",
	"SIGNUP_RATE_LIMITED",
	"SUGGESTION_RATE_LIMITED",
])

const SERVER_ERROR_MESSAGES_BY_CODE = {
	AI_SERVICE_ERROR: "The AI service is unavailable right now. Try again in a moment.",
	AI_SERVICE_NOT_CONFIGURED: "The AI service is unavailable right now. Try again in a moment.",
	AI_INVALID_RESPONSE: "The AI service returned an invalid response. Try again in a moment.",
	TRANSLATION_PROVIDER_ERROR: "Translation is unavailable right now. Try again in a moment.",
	INTERNAL_SERVER_ERROR: "Something went wrong on our side. Try again in a moment.",
}

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again."
const SERVER_ERROR_MESSAGE = "Something went wrong on our side. Try again in a moment."

export function subscribeToApiErrorToasts(onToast) {
	if (typeof window === "undefined") return () => {}

	function handleApiErrorToast(event) {
		if (!event.detail) return
		onToast(event.detail)
	}

	window.addEventListener(API_ERROR_TOAST_EVENT, handleApiErrorToast)

	return () => {
		window.removeEventListener(API_ERROR_TOAST_EVENT, handleApiErrorToast)
	}
}

export function notifyApiErrorToast(error) {
	if (typeof window === "undefined") return

	const toast = createApiErrorToast(error)
	if (!toast) return

	window.dispatchEvent(
		new CustomEvent(API_ERROR_TOAST_EVENT, {
			detail: toast,
		}),
	)
}

export function createApiErrorToast(error) {
	const message = apiErrorToastMessage(error)
	if (!message) return null

	return {
		id: createToastId(),
		type: "error",
		message,
	}
}

function apiErrorToastMessage(error) {
	if (isAbortError(error)) return ""

	const status = Number(error?.status)
	const errorCode = getApiErrorCode(error)

	if (status === 429 || RATE_LIMIT_ERROR_CODES.has(errorCode)) {
		return error?.message || "Too many requests. Please try again later."
	}

	if (status >= 500) {
		return SERVER_ERROR_MESSAGES_BY_CODE[errorCode] || error?.message || SERVER_ERROR_MESSAGE
	}

	// Form, auth, quota, and missing-resource errors already render near the control
	// that caused them. Network failures do not have that context, so they get a toast.
	if (!status && !error?.data) {
		return NETWORK_ERROR_MESSAGE
	}

	return ""
}

function getApiErrorCode(error) {
	return error?.data?.error?.code || ""
}

function isAbortError(error) {
	return error?.name === "AbortError"
}

function createToastId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
