import {
	createConjugationFromData,
	getGodanConjugationOptions,
	initializeNestedElement,
} from "./conjugationOptions"

function findCategory(options, text) {
	return options.find((option) => option.text === text)
}

describe("getGodanConjugationOptions", () => {
	test("adds the special aru negative as a parent-replacing option", () => {
		const options = getGodanConjugationOptions({
			elementType: "verb",
			verbType: "godan-aru",
			ending: "る",
		})

		expect(options[0]).toEqual({ text: "ない", replacesParent: true })
	})

	test("does not include nai inside aru B1 options", () => {
		const options = getGodanConjugationOptions({
			elementType: "verb",
			verbType: "godan-aru",
			ending: "る",
		})
		const b1Options = findCategory(options, "ら").list.map((option) => option.text)

		expect(b1Options).toEqual(["れる", "せる", "ず"])
		expect(b1Options).not.toContain("ない")
	})

	test("uses iku's irregular te and ta forms", () => {
		const options = getGodanConjugationOptions({
			elementType: "verb",
			verbType: "godan-iku",
			ending: "く",
		})

		expect(findCategory(options, "って")).toEqual({
			text: "って",
			list: [{ text: "って", conjugationType: "te" }],
		})
		expect(findCategory(options, "った")).toEqual({
			text: "った",
			list: [{ text: "った" }],
		})
	})

	test("uses the base ending after a godan verb ending has shifted", () => {
		const options = getGodanConjugationOptions({
			elementType: "verb",
			verbType: "godan-iku",
			baseEnding: "く",
			ending: "か",
		})

		expect(findCategory(options, "か")).toEqual({
			text: "か",
			list: [{ text: "ない" }, { text: "れる" }, { text: "せる" }, { text: "ず" }],
		})
		expect(findCategory(options, "った")).toEqual({
			text: "った",
			list: [{ text: "った" }],
		})
	})
})

describe("initializeNestedElement", () => {
	test("initializes a plain verb with its ending as the first conjugation stem", () => {
		expect(
			initializeNestedElement({
				elementType: "verb",
				stem: "食べ",
				ending: "る",
			}),
		).toMatchObject({
			elementType: "verb",
			conjugation: { stem: "る" },
		})
	})

	test("initializes i-adjectives and desu forms", () => {
		expect(
			initializeNestedElement({
				elementType: "adjective",
				adjectiveType: "i-type",
				stem: "高",
				ending: "い",
			}),
		).toMatchObject({
			conjugation: { stem: "い" },
		})

		expect(
			initializeNestedElement({
				elementType: "desu",
				stem: "だ",
			}),
		).toMatchObject({
			conjugation: { stem: "だ" },
		})
	})
})

describe("createConjugationFromData", () => {
	test("creates a normalized conjugation object", () => {
		expect(
			createConjugationFromData({
				conjugationType: "te",
				stem: "食べて",
			}),
		).toEqual({
			conjugationType: "te",
			stem: "食べて",
			ending: "",
			conjugation: {},
		})
	})
})
