import { notifyApiErrorToast } from "./apiErrorToasts"
import type { ApiErrorData } from "./types"

const DEFAULT_API_BASE_URL = "/api/v1"

export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL).replace(
	/\/+$/,
	"",
)

interface ApiErrorOptions {
	status?: number
	data?: unknown
}

export class ApiError extends Error {
	status?: number
	data?: unknown

	constructor(message: string, { status, data }: ApiErrorOptions = {}) {
		super(message)
		this.name = "ApiError"
		this.status = status
		this.data = data
	}
}

interface ApiRequestOptions {
	method?: string
	body?: unknown
	headers?: Record<string, string>
	signal?: AbortSignal
}

function apiPath(path: string) {
	return path.startsWith("/") ? path : `/${path}`
}

async function readResponseData(response: Response) {
	if (typeof response.json !== "function") return null

	try {
		return await response.json()
	} catch {
		return null
	}
}

function responseErrorMessage(data: unknown, fallback: string) {
	if (data && typeof data === "object") {
		const errorData = data as ApiErrorData
		return errorData.error?.message || errorData.message || fallback
	}

	if (typeof data === "string" && data) {
		return data
	}

	return fallback
}

export async function apiRequest<T = unknown>(
	path: string,
	{ method = "GET", body, headers = {}, signal }: ApiRequestOptions = {},
): Promise<T> {
	const hasBody = body !== undefined
	const requestOptions: RequestInit = {
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

	return data as T
}
