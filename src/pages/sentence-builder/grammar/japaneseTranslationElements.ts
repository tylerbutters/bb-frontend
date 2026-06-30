import adjectives from "../jmdict/processed/adjectives.json"
import adverbs from "../jmdict/processed/adverbs.json"
import counters from "../jmdict/processed/counters.json"
import nouns from "../jmdict/processed/nouns.json"
import verbs from "../jmdict/processed/verbs.json"
import {
	findGodanConjugationCategory,
	getConjugationForm,
	getFollowUpConjugationOptions,
	getGodanConjugationOptions,
} from "./conjugationOptions"
import normalizeElement from "./normalizeElement"
import type { ConjugationOption, SentenceElement } from "../types"

type DictionaryGroupName = "nouns" | "verbs" | "adjectives" | "adverbs" | "counters"

interface PromptConjugationStep {
	text?: unknown
	type?: unknown
	conjugation?: PromptConjugationInput
}

type PromptConjugationInput =
	| string
	| number
	| PromptConjugationStep
	| PromptConjugationInput[]
	| null
	| undefined

interface PromptForm {
	conjugation?: PromptConjugationInput
	conjugations?: string[]
	[key: string]: unknown
}

interface PromptTranslationWord {
	kanji?: unknown
	kana?: unknown
	particle?: unknown
	form?: PromptForm
	conjugation?: PromptConjugationInput
}

interface PromptConjugationTextStep {
	text?: string
	type?: string
}

const dictionaryGroups: Record<DictionaryGroupName, SentenceElement[]> = {
	nouns,
	verbs,
	adjectives,
	adverbs,
	counters,
}

const DEFAULT_LOOKUP_ORDER: DictionaryGroupName[] = [
	"verbs",
	"adjectives",
	"adverbs",
	"counters",
	"nouns",
]
const PARTICLE_LOOKUP_ORDER: DictionaryGroupName[] = [
	"nouns",
	"verbs",
	"adjectives",
	"adverbs",
	"counters",
]
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
	negative: {
		ichidan: "ない",
		kureru: "ない",
		kuru: "こない",
		suru: "しない",
	},
	polite: {
		ichidan: "ます",
		kureru: "ます",
		kuru: "きます",
		suru: "します",
	},
	potential: {
		ichidan: "られる",
		kureru: "られる",
		kuru: "こられる",
		suru: "できる",
	},
	te: {
		ichidan: "て",
		kureru: "て",
		kuru: "きて",
		suru: "して",
	},
	want: {
		ichidan: "たい",
		kureru: "たい",
		kuru: "きたい",
		suru: "したい",
	},
}
const CONJUGATION_TYPE_OPTIONS = {
	causative: ["させる", "せる", "こさせる"],
	negative: ["ない", "くない", "しない", "こない", "せん"],
	passive: ["られる", "れる", "される", "こられる"],
	past: ["た", "した", "きた", "かった", "だった"],
	polite: ["ます", "します", "きます"],
	potential: ["られる", "る", "できる", "こられる"],
	te: ["て", "して", "きて", "くて"],
	want: ["たい", "したい", "きたい"],
}
const baseVerbConjugationTypesByName = BASE_VERB_CONJUGATION_TYPES as Record<
	string,
	Record<string, string | undefined> | undefined
>
const conjugationTypeOptionsByName = CONJUGATION_TYPE_OPTIONS as Record<
	string,
	string[] | undefined
>
const PROMPT_CONJUGATION_TYPES = new Set([
	...Object.keys(BASE_VERB_CONJUGATION_TYPES),
	...Object.keys(CONJUGATION_TYPE_OPTIONS),
])

function normalizeValue(value: unknown) {
	return String(value || "").trim()
}

function isPromptConjugationStep(value: unknown): value is PromptConjugationStep {
	return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function matchesTranslationWord(element: SentenceElement, word: PromptTranslationWord) {
	const kanji = normalizeValue(word?.kanji)
	const kana = normalizeValue(word?.kana)

	if (!kanji || !kana) return false

	if (element.text === kanji && element.textKana === kana) return true
	if (element.text === kanji && !element.textKana && kanji === kana) return true
	if (element.text === kana && element.textKana === kana) return true
	// JMdict marks some common kanji spellings as "usually kana", so the processed
	// element keeps only the kana even when generated prompts include the kanji form.
	if (element.text === kana && !element.textKana) return true

	return false
}

function getInflectableEndingLength(element: SentenceElement) {
	if (!["verb", "adjective"].includes(element?.elementType)) return 0
	if (!element.ending) return 0

	return element.ending.length
}

function applyPromptSurface(element: SentenceElement, word: PromptTranslationWord): SentenceElement {
	const kanji = normalizeValue(word?.kanji)
	const kana = normalizeValue(word?.kana)

	if (!kanji || !kana) return element

	const textKana = kanji === kana ? element.textKana : kana
	const promptElement = {
		...element,
		text: kanji,
		textKana,
	}
	const endingLength = getInflectableEndingLength(promptElement)

	if (!endingLength) return promptElement

	return {
		...promptElement,
		stem: kanji.slice(0, -endingLength),
		stemKana: textKana ? textKana.slice(0, -endingLength) : element.stemKana,
		ending: kanji.slice(-endingLength),
	}
}

function lookupTranslationElement(word: PromptTranslationWord) {
	const lookupOrder = word?.particle ? PARTICLE_LOOKUP_ORDER : DEFAULT_LOOKUP_ORDER

	for (const groupName of lookupOrder) {
		const match = dictionaryGroups[groupName].find((element) =>
			matchesTranslationWord(element, word),
		)

		if (match) return match
	}

	return null
}

function attachParticle(element: SentenceElement, particleText: unknown): SentenceElement {
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

function cloneConjugation(conjugation: unknown): unknown {
	if (!conjugation || typeof conjugation !== "object") return conjugation

	const conjugationDetails = conjugation as ConjugationOption
	return {
		...conjugationDetails,
		conjugation: cloneConjugation(conjugationDetails.conjugation),
	}
}

function createPromptConjugation(conjugationText: string): ConjugationOption {
	const conjugationForm = getConjugationForm(conjugationText)

	if (!conjugationForm) {
		return {
			stem: conjugationText,
			conjugation: {},
		}
	}

	return {
		...conjugationForm,
		conjugation: {},
	}
}

function appendConjugationChain(
	conjugation: ConjugationOption,
	conjugationTexts: string[],
): ConjugationOption {
	if (!conjugationTexts.length) return conjugation

	return {
		...conjugation,
		conjugation: resolveConjugationChain(conjugationTexts),
	}
}

function resolveConjugationChain(conjugationTexts: string[] = []): ConjugationOption | Record<string, never> {
	const [conjugationText, ...remainingTexts] = conjugationTexts
	if (!conjugationText) return {}

	return appendConjugationChain(createPromptConjugation(conjugationText), remainingTexts)
}

function resolveGodanConjugation(element: SentenceElement, conjugationTexts: string[]) {
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

function isGodanVerb(element: SentenceElement) {
	return element?.elementType === "verb" && element.verbType?.includes("godan")
}

function getConjugationOptionsForElement(element: SentenceElement) {
	return getFollowUpConjugationOptions(element)
}

function getGodanCategoryByListText(element: SentenceElement, text: string) {
	return getGodanConjugationOptions(element).find((category) =>
		category.list?.some((conjugation) => conjugation.text === text),
	)
}

function resolveGodanConjugationTypeTexts(element: SentenceElement, type: string) {
	if (type === "past") {
		const godanOptions = getGodanConjugationOptions(element)
		const pastCategory = godanOptions[godanOptions.length - 1]
		return pastCategory ? [pastCategory.text] : []
	}

	const optionText = {
		causative: "せる",
		negative: "ない",
		passive: "れる",
		polite: "ます",
		potential: "る",
		te: "__te__",
		want: "たい",
	}[type]
	if (!optionText) return []

	if (optionText === "__te__") {
		const godanOptions = getGodanConjugationOptions(element)
		const teCategory = godanOptions[godanOptions.length - 2]
		return teCategory ? [teCategory.text] : []
	}

	const category = getGodanCategoryByListText(element, optionText)
	return category ? [category.text, optionText] : []
}

function resolveBaseVerbConjugationTypeText(element: SentenceElement, type: string) {
	const optionsByVerbType = baseVerbConjugationTypesByName[type]
	if (!optionsByVerbType || !element.verbType) return undefined

	return optionsByVerbType[element.verbType]
}

function resolveConjugationOptionTypeText(element: SentenceElement, type: string) {
	const candidates = conjugationTypeOptionsByName[type] || []
	return getConjugationOptionsForElement(element).find((option) => candidates.includes(option.text))
		?.text
}

function resolvePromptConjugationStepTexts(
	element: SentenceElement,
	step: PromptConjugationTextStep,
) {
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

function getParentAfterConjugationText(parent: SentenceElement, conjugationText: string) {
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

function getParentAfterConjugationTexts(parent: SentenceElement, conjugationTexts: string[]) {
	return conjugationTexts.reduce(getParentAfterConjugationText, parent)
}

function applyPromptConjugations(element: SentenceElement, conjugationTexts: unknown): SentenceElement {
	if (!Array.isArray(conjugationTexts) || conjugationTexts.length === 0) return element
	const conjugationTextList = conjugationTexts.map(normalizeValue).filter(Boolean)
	if (conjugationTextList.length === 0) return element

	if (element.verbType?.includes("godan")) {
		const godanElement = resolveGodanConjugation(element, conjugationTextList)
		if (godanElement) return godanElement
	}

	return {
		...element,
		conjugation: resolveConjugationChain(conjugationTextList),
	}
}

function getPromptConjugationSteps(promptConjugation: PromptConjugationInput): PromptConjugationTextStep[] {
	if (Array.isArray(promptConjugation)) {
		return promptConjugation
			.map((conjugationStep) => {
				if (isPromptConjugationStep(conjugationStep)) {
					const text = normalizeValue(conjugationStep.text)
					const type = normalizeValue(conjugationStep.type)
					return text ? { text } : type ? { type } : null
				}

				const value = normalizeValue(conjugationStep)
				if (!value) return null

				return PROMPT_CONJUGATION_TYPES.has(value) ? { type: value } : { text: value }
			})
			.filter(Boolean) as PromptConjugationTextStep[]
	}

	if (!promptConjugation || typeof promptConjugation !== "object") return []
	if (!isPromptConjugationStep(promptConjugation)) return []

	const text = normalizeValue(promptConjugation.text)
	const type = normalizeValue(promptConjugation.type)
	const step = text ? { text } : type ? { type } : null
	if (!step) return []

	return [step, ...getPromptConjugationSteps(promptConjugation.conjugation)]
}

function getPromptConjugationTexts(
	element: SentenceElement,
	promptConjugation: PromptConjugationInput,
) {
	const steps = getPromptConjugationSteps(promptConjugation)
	let parent = element

	return steps.flatMap((step) => {
		const conjugationTexts = resolvePromptConjugationStepTexts(parent, step)
		parent = getParentAfterConjugationTexts(parent, conjugationTexts)

		return conjugationTexts
	})
}

function applyPromptConjugation(
	element: SentenceElement,
	promptConjugation: PromptConjugationInput,
) {
	return applyPromptConjugations(element, getPromptConjugationTexts(element, promptConjugation))
}

function applyPromptForm(element: SentenceElement, form: PromptForm | undefined): SentenceElement {
	if (!form || typeof form !== "object") return element

	if (Array.isArray(form.conjugations)) {
		return applyPromptConjugations(element, form.conjugations)
	}

	if (
		Array.isArray(form.conjugation) ||
		(isPromptConjugationStep(form.conjugation) &&
			(form.conjugation.text || form.conjugation.type))
	) {
		return applyPromptConjugation(element, form.conjugation)
	}

	return {
		...element,
		...form,
		conjugation: cloneConjugation(form.conjugation ?? element.conjugation) as
			| ConjugationOption
			| null
			| undefined,
	}
}

function canAttachPromptParticle(element: SentenceElement) {
	return ["noun", "counter"].includes(element?.elementType)
}

export function japaneseTranslationToElements(
	japaneseTranslation: PromptTranslationWord[] = [],
): SentenceElement[] {
	if (!Array.isArray(japaneseTranslation)) return []
	// alert(JSON.stringify(japaneseTranslation))
	return japaneseTranslation
		.map((word) => {
			const match = lookupTranslationElement(word)
			if (!match) return null

			const elementWithPromptSurface = applyPromptSurface(match, word)
			const elementWithForm = applyPromptForm(elementWithPromptSurface, word.form)
			const elementWithConjugation = applyPromptConjugation(elementWithForm, word.conjugation)

			return normalizeElement(attachParticle(elementWithConjugation, word.particle))
		})
		.filter((element): element is SentenceElement => Boolean(element))
}
