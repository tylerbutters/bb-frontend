import { apiRequest } from "./client"

export async function createUser(user) {
	const data = await apiRequest("/users", {
		method: "POST",
		body: user,
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
