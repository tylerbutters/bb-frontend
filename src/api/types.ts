export type UserId = string | number

export type UserPlan = "free" | "premium" | string
export type UserRole = "admin" | "user" | string

export interface User {
	id: UserId
	email: string
	role?: UserRole
	plan?: UserPlan
	createdAt?: string
	updatedAt?: string
	[key: string]: unknown
}

export type PromptDifficulty = "easy" | "medium" | "hard"
export type StatsDifficulty = "all" | PromptDifficulty

export type GameMode =
	| "sandbox"
	| "translate"
	| "conjugations"
	| "fix sentence"
	| "particles"
	| "reorder"
	| "shuffle"

export interface ApiErrorDetails {
	quota?: GameQuota
	[key: string]: unknown
}

export interface ApiErrorPayload {
	code?: string
	message?: string
	details?: ApiErrorDetails
}

export interface ApiErrorData {
	error?: ApiErrorPayload
	message?: string
	[key: string]: unknown
}

export interface RequestOptions {
	signal?: AbortSignal
}

export interface PaginationOptions extends RequestOptions {
	limit?: number
	offset?: number
}

export interface GameHistoryQuery extends PaginationOptions {
	mode?: string
	difficulty?: string
}

export interface GameQuota {
	plan?: UserPlan
	limit?: number | null
	used?: number
	remaining?: number | null
	resetsAt?: string
	canPlay?: boolean
	[key: string]: unknown
}

export interface GameStats {
	totalGames?: number
	correct?: number
	incorrect?: number
	accuracy?: number
	[key: string]: unknown
}

export interface GameStatsItem extends GameStats {
	mode?: string
	label?: string
}

export interface GameStatsGroup {
	total?: GameStats
	games?: GameStatsItem[]
	[key: string]: unknown
}

export interface GameStatsResponse extends GameStatsGroup {
	byDifficulty?: Record<string, GameStatsGroup>
}

export interface GameHistoryItem {
	id?: UserId
	challengeId?: string
	mode?: string
	label?: string
	difficulty?: string | null
	prompt?: string
	answer?: string
	correct?: boolean
	feedback?: string
	createdAt?: string
	recordedAt?: string
	[key: string]: unknown
}

export interface GameHistoryResponse {
	items?: GameHistoryItem[]
	hasMore?: boolean
	nextOffset?: number | null
	[key: string]: unknown
}

export interface UsersResponse {
	items?: User[]
	hasMore?: boolean
	nextOffset?: number | null
}

export interface AdminUserResponse {
	user: User
	stats?: GameStatsResponse
}

export interface UserResponse {
	user: User
	message?: string
	[key: string]: unknown
}

export interface MessageResponse {
	message?: string
	[key: string]: unknown
}

export interface PromptTranslationWord {
	kanji?: string
	kana?: string
	particle?: string
	[key: string]: unknown
}

export interface GamePromptData {
	prompt?: string
	mode?: string
	difficulty?: string
	challengeId?: string
	japaneseTranslation?: PromptTranslationWord[]
	quota?: GameQuota
	[key: string]: unknown
}

export interface GameCheckResponse {
	correct?: boolean
	feedback?: string
	quota?: GameQuota | null
	[key: string]: unknown
}

export interface GameCheckResult {
	correct: boolean
	feedback: string
	quota: GameQuota | null
}
