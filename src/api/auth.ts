import { apiRequest } from "./client"
import type { MessageResponse, User, UserResponse } from "./types"

interface LoginCredentials {
	email: string
	password: string
}

interface PasswordResetRequest {
	email: string
}

interface PasswordResetConfirmation extends PasswordResetRequest {
	code: string
	password: string
}

export async function login(credentials: LoginCredentials): Promise<User> {
	const data = await apiRequest<UserResponse>("/login", {
		method: "POST",
		body: credentials,
	})

	return data.user
}

export async function logout(): Promise<MessageResponse> {
	return apiRequest<MessageResponse>("/login/session", {
		method: "DELETE",
	})
}

export async function requestPasswordReset({
	email,
}: PasswordResetRequest): Promise<MessageResponse> {
	return apiRequest<MessageResponse>("/login/password-reset/request", {
		method: "POST",
		body: { email },
	})
}

export async function confirmPasswordReset({
	email,
	code,
	password,
}: PasswordResetConfirmation): Promise<MessageResponse> {
	return apiRequest<MessageResponse>("/login/password-reset/confirm", {
		method: "POST",
		body: { email, code, password },
	})
}
