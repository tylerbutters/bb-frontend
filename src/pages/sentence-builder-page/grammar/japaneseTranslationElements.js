import adjectives from "../jmdict/processed/adjectives.json"
import adverbs from "../jmdict/processed/adverbs.json"
import counters from "../jmdict/processed/counters.json"
import nouns from "../jmdict/processed/nouns.json"
import verbs from "../jmdict/processed/verbs.json"
import { getGodanConjugationOptions } from "./conjugationOptions"
import { conjugations } from "./elementData"
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
const BASE_VERB_CONJUGATION_TYPES = {
	causative: {
		ichidan: "させる",
		kureru: "させる",
		kuru: "こさせる",
		suru: "させる",
	},
	passive: {
		ichidan: "られる",
		kureru: "られる",
		kuru: "こられる",
		suru: "される",
	},
	past: {
		ichidan: "た",
		kureru: "た",
		kuru: "きた",
		suru: "した",
	},
}
const CONJUGATION_TYPE_OPTIONS = {
	causative: ["させる", "せる", "こさせる"],
	passive: ["られる", "れる", "される", "こられる"],
	past: ["た", "した", "きた", "かった", "だった"],
}
const PROMPT_CONJUGATION_TYPES = new Set([
	...Object.keys(BASE_VERB_CONJUGATION_TYPES),
	...Object.keys(CONJUGATION_TYPE_OPTIONS),
])

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
	if (!particle || !canAttachPromptParticle(element)) return element

	return {
		...element,
		particle: {
			elementType: "particle",
			text: particle,
		},
	}
}

function cloneConjugation(conjugation) {
	if (!conjugation || typeof conjugation !== "object") return conjugation

	return {
		...conjugation,
		conjugation: cloneConjugation(conjugation.conjugation),
	}
}

function createPromptConjugation(conjugationText) {
	const conjugationData = conjugations[conjugationText]

	if (!conjugationData) {
		return {
			stem: conjugationText,
			conjugation: {},
		}
	}

	return {
		...conjugationData,
		conjugation: {},
	}
}

function appendConjugationChain(conjugation, conjugationTexts) {
	if (!conjugationTexts.length) return conjugation

	return {
		...conjugation,
		conjugation: resolveConjugationChain(conjugationTexts),
	}
}

function resolveConjugationChain(conjugationTexts = []) {
	const [conjugationText, ...remainingTexts] = conjugationTexts
	if (!conjugationText) return {}

	return appendConjugationChain(createPromptConjugation(conjugationText), remainingTexts)
}

function findGodanConjugationCategory(element, conjugationText) {
	const conjugationOptions = getGodanConjugationOptions(element)

	return (
		conjugationOptions.find((category) => category.text === conjugationText) ||
		conjugationOptions.find((category) =>
			category.list?.some((conjugation) => conjugation.text === conjugationText),
		)
	)
}

function resolveGodanConjugation(element, conjugationTexts) {
	const [conjugationText, ...remainingTexts] = conjugationTexts
	const selectedCategory = findGodanConjugationCategory(element, conjugationText)
	if (!selectedCategory) return null

	const selectedConjugation =
		selectedCategory.list?.find((conjugation) => conjugation.text === conjugationText) || {}
	const isCategoryStem = selectedCategory.text === conjugationText
	if (isCategoryStem && remainingTexts.length > 0) {
		return {
			...element,
			baseEnding: element.baseEnding || element.ending,
			ending: selectedCategory.text,
			conjugation: resolveConjugationChain(remainingTexts),
		}
	}

	const conjugation = isCategoryStem
		? {
				conjugationType: selectedConjugation.conjugationType,
				stem: conjugationText,
				conjugationOptions: selectedCategory.list || [],
				conjugation: {},
			}
		: createPromptConjugation(conjugationText)

	return {
		...element,
		baseEnding: element.baseEnding || element.ending,
		ending: selectedCategory.text,
		conjugation: appendConjugationChain(conjugation, remainingTexts),
	}
}

function isGodanVerb(element) {
	return element?.elementType === "verb" && element.verbType?.includes("godan")
}

function getConjugationOptionsForElement(element) {
	return (
		element?.conjugationOptions ||
		conjugations[`${element?.stem || ""}${element?.ending || ""}`]?.conjugationOptions ||
		[]
	)
}

function getGodanCategoryByListText(element, text) {
	return getGodanConjugationOptions(element).find((category) =>
		category.list?.some((conjugation) => conjugation.text === text),
	)
}

function resolveGodanConjugationTypeTexts(element, type) {
	if (type === "past") {
		const godanOptions = getGodanConjugationOptions(element)
		const pastCategory = godanOptions[godanOptions.length - 1]
		return pastCategory ? [pastCategory.text] : []
	}

	const optionText = {
		causative: "せる",
		passive: "れる",
	}[type]
	if (!optionText) return []

	const category = getGodanCategoryByListText(element, optionText)
	return category ? [category.text, optionText] : []
}

function resolveBaseVerbConjugationTypeText(element, type) {
	return BASE_VERB_CONJUGATION_TYPES[type]?.[element?.verbType]
}

function resolveConjugationOptionTypeText(element, type) {
	const candidates = CONJUGATION_TYPE_OPTIONS[type] || []
	return getConjugationOptionsForElement(element).find((option) =>
		candidates.includes(option.text),
	)?.text
}

function resolvePromptConjugationStepTexts(element, step) {
	const directText = normalizeValue(step.text)
	if (directText) return [directText]

	const type = normalizeValue(step.type)
	if (!type) return []

	if (isGodanVerb(element)) return resolveGodanConjugationTypeTexts(element, type)

	const text =
		resolveBaseVerbConjugationTypeText(element, type) ||
		resolveConjugationOptionTypeText(element, type)

	return text ? [text] : [type]
}

function getParentAfterConjugationText(parent, conjugationText) {
	if (isGodanVerb(parent)) {
		const selectedCategory = findGodanConjugationCategory(parent, conjugationText)
		if (selectedCategory?.text === conjugationText) {
			return {
				stem: conjugationText,
				conjugationOptions: selectedCategory.list || [],
			}
		}
	}

	return createPromptConjugation(conjugationText)
}

function getParentAfterConjugationTexts(parent, conjugationTexts) {
	return conjugationTexts.reduce(getParentAfterConjugationText, parent)
}

function applyPromptConjugations(element, conjugationTexts) {
	if (!Array.isArray(conjugationTexts) || conjugationTexts.length === 0) return element

	if (element.verbType?.includes("godan")) {
		const godanElement = resolveGodanConjugation(element, conjugationTexts)
		if (godanElement) return godanElement
	}

	return {
		...element,
		conjugation: resolveConjugationChain(conjugationTexts),
	}
}

function getPromptConjugationSteps(promptConjugation) {
	if (Array.isArray(promptConjugation)) {
		return promptConjugation
			.map((conjugationStep) => {
				if (typeof conjugationStep === "object" && conjugationStep !== null) {
					const text = normalizeValue(conjugationStep.text)
					const type = normalizeValue(conjugationStep.type)
					return text ? { text } : type ? { type } : null
				}

				const value = normalizeValue(conjugationStep)
				if (!value) return null

				return PROMPT_CONJUGATION_TYPES.has(value) ? { type: value } : { text: value }
			})
			.filter(Boolean)
	}

	if (!promptConjugation || typeof promptConjugation !== "object") return []

	const text = normalizeValue(promptConjugation.text)
	const type = normalizeValue(promptConjugation.type)
	const step = text ? { text } : type ? { type } : null
	if (!step) return []

	return [step, ...getPromptConjugationSteps(promptConjugation.conjugation)]
}

function getPromptConjugationTexts(element, promptConjugation) {
	const steps = getPromptConjugationSteps(promptConjugation)
	let parent = element

	return steps.flatMap((step) => {
		const conjugationTexts = resolvePromptConjugationStepTexts(parent, step)
		parent = getParentAfterConjugationTexts(parent, conjugationTexts)

		return conjugationTexts
	})
}

function applyPromptConjugation(element, promptConjugation) {
	return applyPromptConjugations(element, getPromptConjugationTexts(element, promptConjugation))
}

function applyPromptForm(element, form) {
	if (!form || typeof form !== "object") return element

	if (Array.isArray(form.conjugations)) {
		return applyPromptConjugations(element, form.conjugations)
	}

	if (
		Array.isArray(form.conjugation) ||
		form.conjugation?.text ||
		form.conjugation?.type
	) {
		return applyPromptConjugation(element, form.conjugation)
	}

	return {
		...element,
		...form,
		conjugation: cloneConjugation(form.conjugation ?? element.conjugation),
	}
}

function canAttachPromptParticle(element) {
	return ["noun", "counter"].includes(element?.elementType)
}

export function japaneseTranslationToElements(japaneseTranslation = []) {
	if (!Array.isArray(japaneseTranslation)) return []
	// alert(JSON.stringify(japaneseTranslation))
	return japaneseTranslation
		.map((word) => {
			const match = lookupTranslationElement(word)
			if (!match) return null

			const elementWithForm = applyPromptForm(match, word.form)
			const elementWithConjugation = applyPromptConjugation(elementWithForm, word.conjugation)

			return normalizeElement(attachParticle(elementWithConjugation, word.particle))
		})
		.filter(Boolean)
}
