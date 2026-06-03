import { useCallback, useEffect, useState } from "react"
import { getUserGameQuota } from "./api/users"

function normalizeQuota(quota, currentUser) {
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

export function useGameQuota(currentUser) {
	const [quota, setQuota] = useState(null)
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")

	const applyQuota = useCallback(
		(nextQuota) => {
			if (!currentUser) {
				setQuota(null)
				return
			}

			setQuota(normalizeQuota(nextQuota, currentUser))
		},
		[currentUser],
	)

	const recordLocalChallengeCheck = useCallback(
		(challenge) => {
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
		async ({ signal } = {}) => {
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
				if (error.name === "AbortError") return null

				console.log(error)

				setStatus("error")
				setMessage(error.message || "Could not load game limit.")
				setQuota(null)
				return null
			}
		},
		[currentUser],
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
