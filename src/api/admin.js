import { apiRequest } from "./client"

export async function getAdminUsers({
	query = "",
	limit = 25,
	offset = 0,
	signal,
} = {}) {
	const params = new URLSearchParams({
		query,
		limit: String(limit),
		offset: String(offset),
	})

	return apiRequest(`/admin/users?${params}`, { signal })
}

export async function getAdminUser(userId, { signal } = {}) {
	return apiRequest(`/admin/users/${userId}`, { signal })
}

export async function getAdminUserGameHistory(
	userId,
	{ mode = "all", difficulty = "all", limit = 50, offset = 0, signal } = {},
) {
	const params = new URLSearchParams({
		mode,
		difficulty,
		limit: String(limit),
		offset: String(offset),
	})

	return apiRequest(`/admin/users/${userId}/game-history?${params}`, { signal })
}
