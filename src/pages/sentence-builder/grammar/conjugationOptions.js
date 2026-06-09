import {
	baseOptionsByParentType,
	conjugationFormByText,
	followUpOptionsByKey,
	godanDefaults,
	godanRows,
} from "./conjugationData"

const ARU_B1_OPTIONS = godanDefaults.b1.filter((option) => option.text !== "ない")

function getGodanEnding(parentConjugation) {
	return parentConjugation.verbType === "godan-haru"
		? "る"
		: parentConjugation.baseEnding || parentConjugation.ending
}

function createGodanCategory(text, list) {
	const directOption = list?.length === 1 && list[0].text === text ? list[0] : null
	const { text: _optionText, ...directOptionDetails } = directOption || {}

	return { text, ...directOptionDetails, list }
}

function createGodanB2Category(text) {
	return createGodanCategory(text, [
		...godanDefaults.b2,
		{ text, conjugationType: "aux", detailId: "verb-stem" },
	])
}

function createGodanB3Category(text) {
	return createGodanCategory(text, [{ text, detailId: "verb-non-past" }])
}

function createGodanTeCategory(text) {
	return createGodanCategory(text, [{ text, conjugationType: "te", detailId: "verb-te-form" }])
}

function createGodanPastCategory(text) {
	return createGodanCategory(text, [{ text, detailId: "verb-past" }])
}

function createStandardGodanCategories(row) {
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

export function getGodanConjugationOptions(parentConjugation) {
	const row = godanRows[getGodanEnding(parentConjugation)]
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

export function findGodanConjugationCategory(parentConjugation, text) {
	return getGodanConjugationOptions(parentConjugation).find(
		(category) =>
			category.text === text || category.list?.some((conjugation) => conjugation.text === text),
	)
}

function hydrateConjugationForm(form) {
	if (!form) return null

	const { followUpOptionsKey, ...conjugationForm } = form
	if (!followUpOptionsKey) return conjugationForm

	// Callers need ready-to-render options, not the compact data-table key.
	return {
		...conjugationForm,
		conjugationOptions: followUpOptionsByKey[followUpOptionsKey] || [],
	}
}

export function getConjugationForm(text) {
	return hydrateConjugationForm(conjugationFormByText[text])
}

export function getFollowUpConjugationOptions(conjugation) {
	if (conjugation?.conjugationOptions) return conjugation.conjugationOptions

	const conjugationText = `${conjugation?.stem || ""}${conjugation?.ending || ""}`
	return getConjugationForm(conjugationText)?.conjugationOptions || []
}

export function getBaseConjugationOptions(parentConjugation) {
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

		return baseOptionsByParentType[parentConjugation.verbType] || []
	}

	if (parentConjugation.elementType === "desu") return baseOptionsByParentType.desu

	return null
}

export function getConjugationOptionsForParent(parentConjugation) {
	const baseOptions = getBaseConjugationOptions(parentConjugation)
	return baseOptions || getFollowUpConjugationOptions(parentConjugation)
}

export function initializeNestedElement(element) {
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

export function createConjugationFromForm(conjugationForm = {}) {
	return {
		conjugationType: conjugationForm.conjugationType,
		stem: conjugationForm.stem || "",
		ending: conjugationForm.ending || "",
		conjugation: {},
	}
}
