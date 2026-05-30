import { useCallback, useEffect, useState } from "react"
import { getUserGameQuota } from "./api/users"

const FREE_DAILY_CHALLENGE_LIMIT = 3
const LOCAL_QUOTA_STORAGE_PREFIX = "bbFreeGameQuota"

function utcDayKey(date = new Date()) {
	return date.toISOString().slice(0, 10)
}

function nextUtcReset(date = new Date()) {
	const resetDate = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
	)

	return resetDate.toISOString()
}

function localQuotaStorageKey(userId, date = new Date()) {
	return `${LOCAL_QUOTA_STORAGE_PREFIX}:${userId}:${utcDayKey(date)}`
}

function readLocalQuotaEntry(userId) {
	if (!userId) return { used: 0, challengeIds: [] }

	try {
		const entry = JSON.parse(window.localStorage.getItem(localQuotaStorageKey(userId)))
		if (!entry || typeof entry !== "object") return { used: 0, challengeIds: [] }

		return {
			used: Number(entry.used || 0),
			challengeIds: Array.isArray(entry.challengeIds) ? entry.challengeIds : [],
		}
	} catch {
		return { used: 0, challengeIds: [] }
	}
}

function writeLocalQuotaEntry(userId, entry) {
	if (!userId) return

	window.localStorage.setItem(
		localQuotaStorageKey(userId),
		JSON.stringify({
			used: Number(entry.used || 0),
			challengeIds: Array.isArray(entry.challengeIds) ? entry.challengeIds : [],
		}),
	)
}

function createChallengeQuotaKey({ challengeId, gameMode, difficulty, prompt } = {}) {
	if (challengeId) return `id:${challengeId}`
	if (!prompt) return ""

	return `prompt:${gameMode || "unknown"}:${difficulty || "easy"}:${prompt}`
}

function createUnlimitedQuota(quota, currentUser) {
	return {
		plan: quota?.plan || currentUser?.plan || "free",
		limit: null,
		used: Number(quota?.used || 0),
		remaining: null,
		resetsAt: quota?.resetsAt || nextUtcReset(),
		canPlay: true,
	}
}

function normalizeQuota(quota, currentUser) {
	return createUnlimitedQuota(quota, currentUser)

	/*
	TODO(premium): Re-enable finite free quota handling when premium is live.
	const plan = quota?.plan || currentUser?.plan || "free"
	const isPremium = plan === "premium"
	const limit = isPremium ? null : Number(quota?.limit ?? FREE_DAILY_CHALLENGE_LIMIT)
	const used = Number(quota?.used || 0)
	const remaining = isPremium
		? null
		: Math.max(Number(quota?.remaining ?? limit - used), 0)

	return {
		plan,
		limit,
		used,
		remaining,
		resetsAt: quota?.resetsAt || "",
		canPlay: isPremium || remaining > 0,
	}
	*/
}

function createLocalQuota(currentUser, used) {
	return normalizeQuota(
		{
			plan: currentUser?.plan || "free",
			limit: FREE_DAILY_CHALLENGE_LIMIT,
			used,
			remaining: Math.max(FREE_DAILY_CHALLENGE_LIMIT - Number(used || 0), 0),
			resetsAt: nextUtcReset(),
		},
		currentUser,
	)
}

function mergeQuotaWithLocalUsage(quota, currentUser) {
	const normalizedQuota = normalizeQuota(quota, currentUser)
	return normalizedQuota

	/*
	TODO(premium): Re-enable local usage merging for free-account quota fallback.
	if (normalizedQuota.plan === "premium") return normalizedQuota

	const localUsage = readLocalQuotaEntry(currentUser?.id)
	const used = Math.max(Number(normalizedQuota.used || 0), Number(localUsage.used || 0))

	return createLocalQuota(currentUser, used)
	*/
}

export function useGameQuota(currentUser) {
	const [quota, setQuota] = useState(() =>
		currentUser
			? createLocalQuota(currentUser, readLocalQuotaEntry(currentUser.id).used)
			: null,
	)
	const [status, setStatus] = useState("idle")
	const [message, setMessage] = useState("")

	const applyQuota = useCallback(
		(nextQuota) => {
			if (!currentUser) {
				setQuota(null)
				return
			}

			setQuota(mergeQuotaWithLocalUsage(nextQuota, currentUser))
		},
		[currentUser],
	)

	const recordLocalChallengeCheck = useCallback(
		(challenge) => {
			return null

			/*
			TODO(premium): Re-enable local quota tracking for free challenge checks.
			if (
				!currentUser ||
				currentUser.plan === "premium" ||
				challenge?.serverQuota?.plan === "premium"
			) {
				return null
			}

			const challengeKey = createChallengeQuotaKey(challenge)
			if (!challengeKey) return null

			const entry = readLocalQuotaEntry(currentUser.id)
			const challengeIds = [...new Set(entry.challengeIds)]
			const wasAlreadyRecorded = challengeIds.includes(challengeKey)
			if (!wasAlreadyRecorded) challengeIds.push(challengeKey)

			const baselineUsed = Math.max(Number(entry.used || 0), Number(quota?.used || 0))
			const used = wasAlreadyRecorded ? baselineUsed : baselineUsed + 1
			writeLocalQuotaEntry(currentUser.id, { used, challengeIds })

			const nextQuota = createLocalQuota(currentUser, used)
			setQuota(nextQuota)
			return nextQuota
			*/
		},
		[currentUser, quota?.used],
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

				const normalizedQuota = mergeQuotaWithLocalUsage(nextQuota, currentUser)
				setQuota(normalizedQuota)
				setStatus("ready")
				return normalizedQuota
			} catch (error) {
				if (error.name === "AbortError") return null

				console.log(error)
				/*
				TODO(premium): Re-enable quota exhaustion fallback for free accounts.
				if (error.status === 401 && currentUser?.plan !== "premium") {
					const exhaustedQuota = createLocalQuota(currentUser, FREE_DAILY_CHALLENGE_LIMIT)
					setQuota(exhaustedQuota)
					setStatus("ready")
					setMessage("")
					return exhaustedQuota
				}
				*/

				setStatus("error")
				setMessage(error.message || "Could not load game limit.")
				setQuota(createLocalQuota(currentUser, readLocalQuotaEntry(currentUser.id).used))
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
