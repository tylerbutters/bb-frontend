const GODAN_ROWS = {
	く: ["か", "き", "く", "け", "こ", "いて", "いた"],
	ぐ: ["が", "ぎ", "ぐ", "げ", "ご", "いで", "いだ"],
	す: ["さ", "し", "す", "せ", "そ", "して", "した"],
	ぶ: ["ば", "び", "ぶ", "べ", "ぼ", "んで", "んだ"],
	む: ["ま", "み", "む", "め", "も", "んで", "んだ"],
	ぬ: ["な", "に", "ぬ", "ね", "の", "んで", "んだ"],
	る: ["ら", "り", "る", "れ", "ろ", "って", "った"],
	つ: ["た", "ち", "つ", "て", "と", "って", "った"],
	う: ["わ", "い", "う", "え", "お", "って", "った"],
}

const GODAN_DEFAULTS = {
	B1: [{ text: "ない" }, { text: "れる" }, { text: "せる" }, { text: "ず" }],
	B2: [{ text: "ます" }, { text: "たい" }],
	B4: [{ text: "ば" }, { text: "る" }, { text: "れ" }],
	B5: [{ text: "う" }],
}

const ARU_B1_OPTIONS = GODAN_DEFAULTS.B1.filter((option) => option.text !== "ない")

function getGodanEnding(parentConjugation) {
	return parentConjugation.verbType === "godan-haru"
		? "る"
		: parentConjugation.baseEnding || parentConjugation.ending
}

function createGodanCategory(text, list) {
	return { text, list }
}

export function getGodanConjugationOptions(parentConjugation) {
	const row = GODAN_ROWS[getGodanEnding(parentConjugation)]
	if (!row) return []

	const [B1, B2, B3, B4, B5, Bte, Bta] = row

	if (parentConjugation.verbType === "godan-aru") {
		return [
			{ text: "ない", replacesParent: true },
			createGodanCategory(B1, ARU_B1_OPTIONS),
			createGodanCategory(B2, [...GODAN_DEFAULTS.B2, { text: B2, conjugationType: "aux" }]),
			createGodanCategory(B3, [{ text: B3 }]),
			createGodanCategory(B4, GODAN_DEFAULTS.B4),
			createGodanCategory(B5, GODAN_DEFAULTS.B5),
			createGodanCategory(Bte, [{ text: Bte, conjugationType: "te" }]),
			createGodanCategory(Bta, [{ text: Bta }]),
		]
	}

	if (parentConjugation.verbType === "godan-haru") {
		return [
			createGodanCategory(B1, GODAN_DEFAULTS.B1),
			createGodanCategory("い", [...GODAN_DEFAULTS.B2, { text: "い" }]),
			createGodanCategory(B2, [{ text: B2, conjugationType: "aux" }]),
			createGodanCategory(B3, [{ text: B3 }]),
			createGodanCategory(B4, GODAN_DEFAULTS.B4),
			createGodanCategory(B5, GODAN_DEFAULTS.B5),
			createGodanCategory(Bte, [{ text: Bte, conjugationType: "te" }]),
			createGodanCategory(Bta, [{ text: Bta }]),
		]
	}

	if (parentConjugation.verbType === "godan-iku") {
		return [
			createGodanCategory(B1, GODAN_DEFAULTS.B1),
			createGodanCategory(B2, [...GODAN_DEFAULTS.B2, { text: B2, conjugationType: "aux" }]),
			createGodanCategory(B3, [{ text: B3 }]),
			createGodanCategory(B4, GODAN_DEFAULTS.B4),
			createGodanCategory(B5, GODAN_DEFAULTS.B5),
			createGodanCategory("って", [{ text: "って", conjugationType: "te" }]),
			createGodanCategory("った", [{ text: "った" }]),
		]
	}

	return [
		createGodanCategory(B1, GODAN_DEFAULTS.B1),
		createGodanCategory(B2, [...GODAN_DEFAULTS.B2, { text: B2, conjugationType: "aux" }]),
		createGodanCategory(B3, [{ text: B3 }]),
		createGodanCategory(B4, GODAN_DEFAULTS.B4),
		createGodanCategory(B5, GODAN_DEFAULTS.B5),
		createGodanCategory(Bte, [{ text: Bte, conjugationType: "te" }]),
		createGodanCategory(Bta, [{ text: Bta }]),
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
