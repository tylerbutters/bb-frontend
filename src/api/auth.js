import { apiRequest } from "./client"

export async function login(credentials) {
	const data = await apiRequest("/login", {
		method: "POST",
		body: credentials,
	})

	return data.user
}

export async function requestPasswordReset({ email }) {
	return apiRequest("/login/password-reset/request", {
		method: "POST",
		body: { email },
	})
}

export async function confirmPasswordReset({ email, code, password, confirmPassword }) {
	return apiRequest("/login/password-reset/confirm", {
		method: "POST",
		body: { email, code, password, confirmPassword },
	})
}
