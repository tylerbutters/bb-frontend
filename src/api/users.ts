import { apiRequest } from "./client"
import type {
	GameHistoryQuery,
	GameHistoryResponse,
	GameQuota,
	GameStatsResponse,
	MessageResponse,
	User,
	UserId,
	UserResponse,
} from "./types"

interface SignupRequest {
	email: string
	password: string
}

interface SignupConfirmation {
	email: string
	code: string
}

interface UserUpdate {
	email?: string
	currentPassword?: string
	password?: string
	[key: string]: unknown
}

export async function requestSignupConfirmation(user: SignupRequest): Promise<MessageResponse> {
	return apiRequest<MessageResponse>("/users/signup-confirmation/request", {
		method: "POST",
		body: user,
	})
}

export async function confirmSignup({ email, code }: SignupConfirmation): Promise<User> {
	const data = await apiRequest<UserResponse>("/users/signup-confirmation/confirm", {
		method: "POST",
		body: { email, code },
	})

	return data.user
}

export async function updateUser(userId: UserId, user: UserUpdate): Promise<UserResponse> {
	return apiRequest<UserResponse>(`/users/${userId}`, {
		method: "PATCH",
		body: user,
	})
}

export async function deleteUser(userId: UserId): Promise<MessageResponse> {
	return apiRequest<MessageResponse>(`/users/${userId}`, {
		method: "DELETE",
	})
}

export async function getUserStats(
	userId: UserId,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<GameStatsResponse> {
	return apiRequest<GameStatsResponse>(`/users/${userId}/stats`, { signal })
}

export async function getUserGameQuota(
	userId: UserId,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<GameQuota> {
	return apiRequest<GameQuota>(`/users/${userId}/game-quota`, { signal })
}

export async function getUserGameHistory(
	userId: UserId,
	{ mode = "all", difficulty = "all", limit = 50, offset = 0, signal }: GameHistoryQuery = {},
): Promise<GameHistoryResponse> {
	const params = new URLSearchParams({
		mode,
		difficulty,
		limit: String(limit),
		offset: String(offset),
	})

	return apiRequest<GameHistoryResponse>(`/users/${userId}/game-history?${params}`, { signal })
}

export async function confirmEmailChange({ token }: { token: string }): Promise<UserResponse> {
	const data = await apiRequest<UserResponse>(`/users/email-change/confirm`, {
		method: "POST",
		body: { token },
	})

	return data
}

export async function requestEmailChange(
	userId: UserId,
	{ email }: { email: string },
): Promise<MessageResponse> {
	const data = await apiRequest<MessageResponse>(`/users/${userId}/email-change/request`, {
		method: "POST",
		body: {
			email,
		},
	})
	return data
}
