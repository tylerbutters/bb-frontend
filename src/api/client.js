import { notifyApiErrorToast } from "./apiErrorToasts"

const DEFAULT_API_BASE_URL = "/api/v1"

export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL).replace(
	/\/+$/,
	"",
)

export class ApiError extends Error {
	constructor(message, { status, data } = {}) {
		super(message)
		this.name = "ApiError"
		this.status = status
		this.data = data
	}
}

function apiPath(path) {
	return path.startsWith("/") ? path : `/${path}`
}

async function readResponseData(response) {
	if (typeof response.json !== "function") return null

	try {
		return await response.json()
	} catch {
		return null
	}
}

function responseErrorMessage(data, fallback) {
	if (data && typeof data === "object") {
		return data.error?.message || data.message || fallback
	}

	if (typeof data === "string" && data) {
		return data
	}

	return fallback
}

export async function apiRequest(path, { method = "GET", body, headers = {}, signal } = {}) {
	const hasBody = body !== undefined
	const requestOptions = {
		method,
		credentials: "include",
		headers: {
			...(hasBody ? { "Content-Type": "application/json" } : {}),
			...headers,
		},
		body: hasBody ? JSON.stringify(body) : undefined,
	}

	if (signal) {
		requestOptions.signal = signal
	}

	let response
	try {
		response = await fetch(`${API_BASE_URL}${apiPath(path)}`, requestOptions)
	} catch (error) {
		notifyApiErrorToast(error)
		throw error
	}
	const data = await readResponseData(response)

	if (!response.ok) {
		const error = new ApiError(
			responseErrorMessage(data, `Request failed with ${response.status}.`),
			{
				status: response.status,
				data,
			},
		)
		notifyApiErrorToast(error)
		throw error
	}

	return data
}
