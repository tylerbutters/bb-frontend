import { godanDefaults, godanRows } from "./conjugationData"

const ARU_B1_OPTIONS = godanDefaults.B1.filter((option) => option.text !== "ない")

function getGodanEnding(parentConjugation) {
	return parentConjugation.verbType === "godan-haru"
		? "る"
		: parentConjugation.baseEnding || parentConjugation.ending
}

function createGodanCategory(text, list) {
	return { text, list }
}

export function getGodanConjugationOptions(parentConjugation) {
	const row = godanRows[getGodanEnding(parentConjugation)]
	if (!row) return []

	const [B1, B2, B3, B4, B5, Bte, Bta] = row

	if (parentConjugation.verbType === "godan-aru") {
		return [
			{ text: "ない", replacesParent: true },
			createGodanCategory(B1, ARU_B1_OPTIONS),
			createGodanCategory(B2, [...godanDefaults.B2, { text: B2, conjugationType: "aux" }]),
			createGodanCategory(B3, [{ text: B3, detailId: "verb-non-past" }]),
			createGodanCategory(B4, godanDefaults.B4),
			createGodanCategory(B5, godanDefaults.B5),
			createGodanCategory(Bte, [{ text: Bte, conjugationType: "te", detailId: "verb-te-form" }]),
			createGodanCategory(Bta, [{ text: Bta, detailId: "verb-past" }]),
		]
	}

	if (parentConjugation.verbType === "godan-haru") {
		return [
			createGodanCategory(B1, godanDefaults.B1),
			createGodanCategory("い", [...godanDefaults.B2, { text: "い" }]),
			createGodanCategory(B2, [{ text: B2, conjugationType: "aux" }]),
			createGodanCategory(B3, [{ text: B3, detailId: "verb-non-past" }]),
			createGodanCategory(B4, godanDefaults.B4),
			createGodanCategory(B5, godanDefaults.B5),
			createGodanCategory(Bte, [{ text: Bte, conjugationType: "te", detailId: "verb-te-form" }]),
			createGodanCategory(Bta, [{ text: Bta, detailId: "verb-past" }]),
		]
	}

	if (parentConjugation.verbType === "godan-iku") {
		return [
			createGodanCategory(B1, godanDefaults.B1),
			createGodanCategory(B2, [...godanDefaults.B2, { text: B2, conjugationType: "aux" }]),
			createGodanCategory(B3, [{ text: B3, detailId: "verb-non-past" }]),
			createGodanCategory(B4, godanDefaults.B4),
			createGodanCategory(B5, godanDefaults.B5),
			createGodanCategory("って", [{ text: "って", conjugationType: "te", detailId: "verb-te-form" }]),
			createGodanCategory("った", [{ text: "った", detailId: "verb-past" }]),
		]
	}

	return [
		createGodanCategory(B1, godanDefaults.B1),
		createGodanCategory(B2, [...godanDefaults.B2, { text: B2, conjugationType: "aux" }]),
		createGodanCategory(B3, [{ text: B3, detailId: "verb-non-past" }]),
		createGodanCategory(B4, godanDefaults.B4),
		createGodanCategory(B5, godanDefaults.B5),
		createGodanCategory(Bte, [{ text: Bte, conjugationType: "te", detailId: "verb-te-form" }]),
		createGodanCategory(Bta, [{ text: Bta, detailId: "verb-past" }]),
	]
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

export function createConjugationFromData(conjugationData) {
	return {
		conjugationType: conjugationData.conjugationType,
		stem: conjugationData.stem || "",
		ending: conjugationData.ending || "",
		conjugation: {},
	}
}
