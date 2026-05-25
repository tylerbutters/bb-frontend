import adjectives from "../jmdict/processed/adjectives.json"
import adverbs from "../jmdict/processed/adverbs.json"
import counters from "../jmdict/processed/counters.json"
import nouns from "../jmdict/processed/nouns.json"
import verbs from "../jmdict/processed/verbs.json"
import normalizeElement from "./normalizeElement"

const dictionaryGroups = {
	nouns,
	verbs,
	adjectives,
	adverbs,
	counters,
}

const DEFAULT_LOOKUP_ORDER = ["verbs", "adjectives", "adverbs", "counters", "nouns"]
const PARTICLE_LOOKUP_ORDER = ["nouns", "verbs", "adjectives", "adverbs", "counters"]

function normalizeValue(value) {
	return String(value || "").trim()
}

function matchesTranslationWord(element, word) {
	const kanji = normalizeValue(word?.kanji)
	const kana = normalizeValue(word?.kana)

	if (!kanji || !kana) return false

	if (element.text === kanji && element.textKana === kana) return true
	if (element.text === kanji && !element.textKana && kanji === kana) return true
	if (element.text === kana && element.textKana === kana) return true

	return false
}

function lookupTranslationElement(word) {
	const lookupOrder = word?.particle ? PARTICLE_LOOKUP_ORDER : DEFAULT_LOOKUP_ORDER

	for (const groupName of lookupOrder) {
		const match = dictionaryGroups[groupName].find((element) =>
			matchesTranslationWord(element, word),
		)

		if (match) return match
	}

	return null
}

function attachParticle(element, particleText) {
	const particle = normalizeValue(particleText)
	if (!particle) return element

	return {
		...element,
		particle: {
			elementType: "particle",
			text: particle,
		},
	}
}

export function japaneseTranslationToElements(japaneseTranslation = []) {
	if (!Array.isArray(japaneseTranslation)) return []

	return japaneseTranslation
		.map((word) => {
			const match = lookupTranslationElement(word)
			if (!match) return null

			return normalizeElement(attachParticle(match, word.particle))
		})
		.filter(Boolean)
}
