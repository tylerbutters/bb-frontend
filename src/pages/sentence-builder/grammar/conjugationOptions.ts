import {
	baseOptionsByParentType,
	conjugationFormByText,
	followUpOptionsByKey,
	godanDefaults,
	godanRows,
} from "./conjugationData"
import type { ConjugationOption, SentenceElement } from "../types"

const ARU_B1_OPTIONS = godanDefaults.b1.filter((option) => option.text !== "ない")

type ConjugatableElement = SentenceElement & ConjugationOption

interface GodanRow {
	b1: string
	b2: string
	b3: string
	b4: string
	b5: string
	te: string
	past: string
}

const godanRowsByEnding = godanRows as Record<string, GodanRow | undefined>
const followUpOptionsByName = followUpOptionsByKey as Record<
	string,
	ConjugationOption[] | undefined
>
const conjugationFormsByText = conjugationFormByText as Record<
	string,
	ConjugationOption | undefined
>
const baseOptionsByType = baseOptionsByParentType as Record<
	string,
	ConjugationOption[] | undefined
>

function getGodanEnding(parentConjugation: ConjugatableElement) {
	return parentConjugation.verbType === "godan-haru"
		? "る"
		: parentConjugation.baseEnding || parentConjugation.ending
}

function createGodanCategory(text: string, list: ConjugationOption[]): ConjugationOption {
	const directOption = list?.length === 1 && list[0].text === text ? list[0] : null
	const { text: _optionText, ...directOptionDetails } = directOption || {}

	return { text, ...directOptionDetails, list }
}

function createGodanB2Category(text: string) {
	return createGodanCategory(text, [
		...godanDefaults.b2,
		{ text, conjugationType: "aux", detailId: "verb-stem" },
	])
}

function createGodanB3Category(text: string) {
	return createGodanCategory(text, [{ text, detailId: "verb-non-past" }])
}

function createGodanTeCategory(text: string) {
	return createGodanCategory(text, [{ text, conjugationType: "te", detailId: "verb-te-form" }])
}

function createGodanPastCategory(text: string) {
	return createGodanCategory(text, [{ text, detailId: "verb-past" }])
}

function createStandardGodanCategories(row: GodanRow) {
	return [
		createGodanCategory(row.b1, godanDefaults.b1),
		createGodanB2Category(row.b2),
		createGodanB3Category(row.b3),
		createGodanCategory(row.b4, godanDefaults.b4),
		createGodanCategory(row.b5, godanDefaults.b5),
		createGodanTeCategory(row.te),
		createGodanPastCategory(row.past),
	]
}

export function getGodanConjugationOptions(parentConjugation: ConjugatableElement): ConjugationOption[] {
	const row = godanRowsByEnding[getGodanEnding(parentConjugation)]
	if (!row) return []

	if (parentConjugation.verbType === "godan-aru") {
		return [
			{ text: "ない", replacesParent: true, detailId: "verb-negative" },
			createGodanCategory(row.b1, ARU_B1_OPTIONS),
			createGodanB2Category(row.b2),
			createGodanB3Category(row.b3),
			createGodanCategory(row.b4, godanDefaults.b4),
			createGodanCategory(row.b5, godanDefaults.b5),
			createGodanTeCategory(row.te),
			createGodanPastCategory(row.past),
		]
	}

	if (parentConjugation.verbType === "godan-haru") {
		return [
			createGodanCategory(row.b1, godanDefaults.b1),
			createGodanCategory("い", [...godanDefaults.b2, { text: "い", detailId: "verb-stem" }]),
			createGodanB2Category(row.b2),
			createGodanB3Category(row.b3),
			createGodanCategory(row.b4, godanDefaults.b4),
			createGodanCategory(row.b5, godanDefaults.b5),
			createGodanTeCategory(row.te),
			createGodanPastCategory(row.past),
		]
	}

	if (parentConjugation.verbType === "godan-iku") {
		return [
			createGodanCategory(row.b1, godanDefaults.b1),
			createGodanB2Category(row.b2),
			createGodanB3Category(row.b3),
			createGodanCategory(row.b4, godanDefaults.b4),
			createGodanCategory(row.b5, godanDefaults.b5),
			createGodanTeCategory("って"),
			createGodanPastCategory("った"),
		]
	}

	return createStandardGodanCategories(row)
}

export function findGodanConjugationCategory(parentConjugation: ConjugatableElement, text: string) {
	return getGodanConjugationOptions(parentConjugation).find(
		(category) =>
			category.text === text || category.list?.some((conjugation) => conjugation.text === text),
	)
}

function hydrateConjugationForm(form?: ConjugationOption | null): ConjugationOption | null {
	if (!form) return null

	const { followUpOptionsKey, ...conjugationForm } = form
	if (!followUpOptionsKey) return conjugationForm

	// Callers need ready-to-render options, not the compact data-table key.
	return {
		...conjugationForm,
		conjugationOptions: followUpOptionsByName[followUpOptionsKey] || [],
	}
}

export function getConjugationForm(text: string): ConjugationOption | null {
	return hydrateConjugationForm(conjugationFormsByText[text])
}

export function getFollowUpConjugationOptions(conjugation?: ConjugatableElement | null): ConjugationOption[] {
	if (conjugation?.conjugationOptions) return conjugation.conjugationOptions

	const conjugationText = `${conjugation?.stem || ""}${conjugation?.ending || ""}`
	return getConjugationForm(conjugationText)?.conjugationOptions || []
}

export function getBaseConjugationOptions(parentConjugation?: ConjugatableElement | null) {
	if (!parentConjugation) return []

	if (parentConjugation.elementType === "adjective") {
		if (parentConjugation.adjectiveType === "i-type") return baseOptionsByParentType.iAdjective
		if (parentConjugation.adjectiveType === "ii") return baseOptionsByParentType.iiAdjective
		return []
	}

	if (parentConjugation.elementType === "verb") {
		if (parentConjugation.verbType?.includes("godan")) {
			return getGodanConjugationOptions(parentConjugation)
		}

		return baseOptionsByType[parentConjugation.verbType] || []
	}

	if (parentConjugation.elementType === "desu") return baseOptionsByType.desu || []

	return null
}

export function getConjugationOptionsForParent(parentConjugation: ConjugatableElement) {
	const baseOptions = getBaseConjugationOptions(parentConjugation)
	return baseOptions || getFollowUpConjugationOptions(parentConjugation)
}

export function initializeNestedElement(element: SentenceElement): SentenceElement {
	if (element.elementType === "verb" && !element.conjugation) {
		return {
			...element,
			conjugation: {
				stem: element?.ending,
			},
		}
	}

	if (
		element.elementType === "adjective" &&
		element.adjectiveType === "i-type" &&
		!element.conjugation
	) {
		return {
			...element,
			conjugation: {
				stem: element?.ending,
			},
		}
	}

	if (element.elementType === "desu" && !element.conjugation) {
		return {
			...element,
			conjugation: {
				stem: element?.stem,
			},
		}
	}

	return element
}

export function createConjugationFromForm(conjugationForm: ConjugationOption = {}): ConjugationOption {
	return {
		conjugationType: conjugationForm.conjugationType,
		stem: conjugationForm.stem || "",
		ending: conjugationForm.ending || "",
		conjugation: {},
	}
}
