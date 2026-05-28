import { apiRequest } from "./client"

export async function requestSignupConfirmation(user) {
	return apiRequest("/users/signup-confirmation/request", {
		method: "POST",
		body: user,
	})
}

export async function confirmSignup({ email, code }) {
	const data = await apiRequest("/users/signup-confirmation/confirm", {
		method: "POST",
		body: { email, code },
	})

	return data.user
}

export async function updateUser(userId, user) {
	return apiRequest(`/users/${userId}`, {
		method: "PATCH",
		body: user,
	})
}

export async function deleteUser(userId) {
	return apiRequest(`/users/${userId}`, {
		method: "DELETE",
	})
}

export async function getUserStats(userId, { signal } = {}) {
	return apiRequest(`/users/${userId}/stats`, { signal })
}

export async function getUserGameHistory(
	userId,
	{ mode = "all", difficulty = "all", limit = 50, offset = 0, signal } = {},
) {
	const params = new URLSearchParams({
		mode,
		difficulty,
		limit: String(limit),
		offset: String(offset),
	})

	return apiRequest(`/users/${userId}/game-history?${params}`, { signal })
}

export async function confirmEmailChange({ token }) {
	const data = await apiRequest(`/users/email-change/confirm`, {
		method: "POST",
		body: { token },
	})

	return data
}

export async function requestEmailChange(userId, { email }) {
	const data = await apiRequest(`/users/${userId}/email-change/request`, {
		method: "POST",
		body: {
			email,
		},
	})
	return data
}
