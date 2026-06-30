import { useCallback, useEffect, useState } from "react"
import { getErrorMessage } from "./api/errors"
import { getUserGameQuota } from "./api/users"
import type { GameQuota, User } from "./api/types"

interface UseGameQuotaOptions {
	onAuthExpired?: () => void
}

interface LocalChallengeCheck {
	serverQuota?: GameQuota | null
}

interface ApiErrorLike {
	status?: number
	data?: {
		error?: {
			code?: string
		}
	}
}

function normalizeQuota(quota: GameQuota | null | undefined, currentUser?: User | null): GameQuota | null {
	if (!quota) return null

	const plan = quota?.plan || currentUser?.plan || "free"
	const isPremium = plan === "premium"
	const limit = quota?.limit == null ? null : Number(quota.limit)
	const used = Number(quota?.used || 0)
	const remaining = isPremium
		? null
		: quota?.remaining == null
			? null
			: Math.max(Number(quota.remaining), 0)
	const canPlay = Boolean(isPremium || quota?.canPlay || (remaining != null && remaining > 0))

	return {
		plan,
		limit,
		used,
		remaining,
		resetsAt: quota?.resetsAt || "",
		canPlay,
	}
}

export function useGameQuota(currentUser?: User | null, { onAuthExpired }: UseGameQuotaOptions = {}) {
	const [quota, setQuota] = useState<GameQuota | null>(null)
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")

	const applyQuota = useCallback(
		(nextQuota: GameQuota | null | undefined) => {
			if (!currentUser) {
				setQuota(null)
				return
			}

			setQuota(normalizeQuota(nextQuota, currentUser))
		},
		[currentUser],
	)

	const recordLocalChallengeCheck = useCallback(
		(challenge: LocalChallengeCheck) => {
			if (!currentUser || !challenge?.serverQuota) {
				return null
			}

			const nextQuota = normalizeQuota(challenge.serverQuota, currentUser)
			setQuota(nextQuota)
			return nextQuota
		},
		[currentUser],
	)

	const refreshQuota = useCallback(
		async ({ signal }: { signal?: AbortSignal } = {}) => {
			if (!currentUser) {
				setQuota(null)
				setStatus("idle")
				setMessage("")
				return null
			}

			setStatus("loading")
			setMessage("")

			try {
				const nextQuota = await getUserGameQuota(currentUser.id, { signal })
				if (signal?.aborted) return null

				const normalizedQuota = normalizeQuota(nextQuota, currentUser)
				setQuota(normalizedQuota)
				setStatus("ready")
				return normalizedQuota
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") return null

				if (isAuthenticationRequiredError(error)) {
					onAuthExpired?.()
				}

				setStatus("error")
				setMessage(getErrorMessage(error, "Could not load game limit."))
				setQuota(null)
				return null
			}
		},
		[currentUser, onAuthExpired],
	)

	useEffect(() => {
		if (!currentUser) {
			setQuota(null)
			setStatus("idle")
			setMessage("")
			return
		}

		const controller = new AbortController()
		refreshQuota({ signal: controller.signal })

		return () => {
			controller.abort()
		}
	}, [currentUser, refreshQuota])

	return {
		applyQuota,
		message,
		quota,
		recordLocalChallengeCheck,
		refreshQuota,
		status,
	}
}

function isAuthenticationRequiredError(error: unknown) {
	const apiError = error as ApiErrorLike
	return apiError?.status === 401 || apiError?.data?.error?.code === "AUTHENTICATION_REQUIRED"
}
