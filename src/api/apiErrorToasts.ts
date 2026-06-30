import type { ApiErrorData } from "./types"

export const API_ERROR_TOAST_EVENT = "bb:api-error-toast"
export const API_ERROR_TOAST_DURATION_MS = 5000

const RATE_LIMIT_ERROR_CODES = new Set([
	"RATE_LIMITED",
	"AUTH_RATE_LIMITED",
	"ACCOUNT_RECOVERY_RATE_LIMITED",
	"SIGNUP_RATE_LIMITED",
	"SUGGESTION_RATE_LIMITED",
])

const SERVER_ERROR_MESSAGES_BY_CODE: Record<string, string> = {
	AI_SERVICE_ERROR: "The AI service is unavailable right now. Try again in a moment.",
	AI_SERVICE_NOT_CONFIGURED: "The AI service is unavailable right now. Try again in a moment.",
	AI_INVALID_RESPONSE: "The AI service returned an invalid response. Try again in a moment.",
	TRANSLATION_PROVIDER_ERROR: "Translation is unavailable right now. Try again in a moment.",
	INTERNAL_SERVER_ERROR: "Something went wrong on our side. Try again in a moment.",
}

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again."
const SERVER_ERROR_MESSAGE = "Something went wrong on our side. Try again in a moment."

export interface ApiErrorToast {
	id: string
	type: "error"
	message: string
	isExiting?: boolean
}

interface ApiErrorLike {
	name?: string
	status?: number | string
	message?: string
	data?: ApiErrorData | null
}

export function subscribeToApiErrorToasts(onToast: (toast: ApiErrorToast) => void) {
	if (typeof window === "undefined") return () => {}

	function handleApiErrorToast(event: Event) {
		const toastEvent = event as CustomEvent<ApiErrorToast>
		if (!toastEvent.detail) return
		onToast(toastEvent.detail)
	}

	window.addEventListener(API_ERROR_TOAST_EVENT, handleApiErrorToast)

	return () => {
		window.removeEventListener(API_ERROR_TOAST_EVENT, handleApiErrorToast)
	}
}

export function notifyApiErrorToast(error: unknown) {
	if (typeof window === "undefined") return

	const toast = createApiErrorToast(error)
	if (!toast) return

	window.dispatchEvent(
		new CustomEvent(API_ERROR_TOAST_EVENT, {
			detail: toast,
		}),
	)
}

export function createApiErrorToast(error: unknown): ApiErrorToast | null {
	const message = apiErrorToastMessage(error)
	if (!message) return null

	return {
		id: createToastId(),
		type: "error",
		message,
	}
}

function apiErrorToastMessage(error: unknown) {
	const apiError = asApiErrorLike(error)
	if (isAbortError(error)) return ""

	const status = Number(apiError.status)
	const errorCode = getApiErrorCode(error)

	if (status === 429 || RATE_LIMIT_ERROR_CODES.has(errorCode)) {
		return apiError.message || "Too many requests. Please try again later."
	}

	if (status >= 500) {
		return SERVER_ERROR_MESSAGES_BY_CODE[errorCode] || apiError.message || SERVER_ERROR_MESSAGE
	}

	// Form, auth, quota, and missing-resource errors already render near the control
	// that caused them. Network failures do not have that context, so they get a toast.
	if (!status && !apiError.data) {
		return NETWORK_ERROR_MESSAGE
	}

	return ""
}

function getApiErrorCode(error: unknown) {
	return asApiErrorLike(error).data?.error?.code || ""
}

function isAbortError(error: unknown) {
	return asApiErrorLike(error).name === "AbortError"
}

function createToastId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function asApiErrorLike(error: unknown): ApiErrorLike {
	return error && typeof error === "object" ? (error as ApiErrorLike) : {}
}
