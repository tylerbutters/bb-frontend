import { apiRequest } from "./client"
import type {
	AdminUserResponse,
	GameHistoryQuery,
	GameHistoryResponse,
	UserId,
	UsersResponse,
} from "./types"

export async function getAdminUsers({
	query = "",
	limit = 25,
	offset = 0,
	signal,
}: { query?: string } & GameHistoryQuery = {}): Promise<UsersResponse> {
	const params = new URLSearchParams({
		query,
		limit: String(limit),
		offset: String(offset),
	})

	return apiRequest<UsersResponse>(`/admin/users?${params}`, { signal })
}

export async function getAdminUser(
	userId: UserId,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<AdminUserResponse> {
	return apiRequest<AdminUserResponse>(`/admin/users/${userId}`, { signal })
}

export async function getAdminUserGameHistory(
	userId: UserId,
	{ mode = "all", difficulty = "all", limit = 50, offset = 0, signal }: GameHistoryQuery = {},
): Promise<GameHistoryResponse> {
	const params = new URLSearchParams({
		mode,
		difficulty,
		limit: String(limit),
		offset: String(offset),
	})

	return apiRequest<GameHistoryResponse>(`/admin/users/${userId}/game-history?${params}`, {
		signal,
	})
}
