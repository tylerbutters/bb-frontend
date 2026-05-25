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
		primary: "var(--color-element-noun-primary)",
		secondary: "var(--color-element-noun-secondary)",
	},
	adjective: {
		primary: "var(--color-element-adjective-primary)",
		secondary: "var(--color-element-adjective-secondary)",
	},
	verb: {
		primary: "var(--color-element-verb-primary)",
		secondary: "var(--color-element-verb-secondary)",
	},
	adverb: {
		primary: "var(--color-element-adverb-primary)",
		secondary: "var(--color-element-adverb-secondary)",
	},
	counter: {
		primary: "var(--color-element-counter-primary)",
		secondary: "var(--color-element-counter-secondary)",
	},
	desu: {
		primary: "var(--color-element-desu-primary)",
		secondary: "var(--color-element-desu-secondary)",
	},
	punctuation: {
		primary: "var(--color-element-punctuation-primary)",
		secondary: "var(--color-element-punctuation-secondary)",
	},
	default: {
		primary: "var(--color-element-default-primary)",
		secondary: "var(--color-element-default-secondary)",
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
