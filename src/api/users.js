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
