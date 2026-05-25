import adjectives from "../jmdict/processed/adjectives.json"
import adverbs from "../jmdict/processed/adverbs.json"
import counters from "../jmdict/processed/counters.json"
import nouns from "../jmdict/processed/nouns.json"
import verbs from "../jmdict/processed/verbs.json"
import Adjective from "./Adjective"
import Adverb from "./Adverb"
import Counter from "./Counter"
import Desu from "./Desu"
import Noun from "./Noun"
import Punctuation from "./Punctuation"
import Verb from "./Verb"

export const ELEMENT_TYPE_COLORS = {
	noun: {
		primary: "rgba(255, 138, 138, 0.72)",
		secondary: "rgba(255, 138, 138, 0.24)",
	},
	adjective: {
		primary: "rgba(255, 184, 112, 0.74)",
		secondary: "rgba(255, 184, 112, 0.24)",
	},
	verb: {
		primary: "rgba(138, 180, 255, 0.74)",
		secondary: "rgba(138, 180, 255, 0.24)",
	},
	adverb: {
		primary: "rgba(139, 199, 149, 0.72)",
		secondary: "rgba(139, 199, 149, 0.24)",
	},
	counter: {
		primary: "rgba(207, 143, 255, 0.72)",
		secondary: "rgba(207, 143, 255, 0.24)",
	},
	desu: {
		primary: "rgba(130, 204, 214, 0.72)",
		secondary: "rgba(130, 204, 214, 0.24)",
	},
	punctuation: {
		primary: "rgba(180, 184, 191, 0.72)",
		secondary: "rgba(180, 184, 191, 0.24)",
	},
	default: {
		primary: "rgba(255, 255, 255, 0.18)",
		secondary: "rgba(255, 255, 255, 0.12)",
	},
}

export const ELEMENT_TYPE_LABELS = {
	noun: "Noun",
	verb: "Verb",
	adjective: "Adjective",
	adverb: "Adverb",
	counter: "Counter",
	desu: "だ",
	punctuation: "Punctuation",
}

const ELEMENT_TYPE_COMPONENTS = {
	noun: Noun,
	adjective: Adjective,
	verb: Verb,
	punctuation: Punctuation,
	adverb: Adverb,
	desu: Desu,
	counter: Counter,
}

export function getElementTypeColors(elementType) {
	return ELEMENT_TYPE_COLORS[elementType] || ELEMENT_TYPE_COLORS.default
}

export function getElementTypeComponent(elementType) {
	return ELEMENT_TYPE_COMPONENTS[elementType] || null
}

export function getDefaultElementOptions({ punctuation = [] } = {}) {
	return [
		{ text: "Nouns", list: nouns },
		{ text: "Verbs", list: verbs },
		{ text: "Adjectives", list: adjectives },
		{ text: "Adverbs", list: adverbs },
		{ text: "Counters", list: counters },
		{ text: ELEMENT_TYPE_LABELS.punctuation, list: punctuation },
		{ text: ELEMENT_TYPE_LABELS.desu, list: [{ elementType: "desu", text: "だ", stem: "だ" }] },
	]
}
