import {
	createConjugationFromForm,
	getConjugationForm,
	getConjugationOptionsForParent,
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

		expect(options[0]).toEqual({
			text: "ない",
			replacesParent: true,
			detailId: "verb-negative",
		})
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
			conjugationType: "te",
			detailId: "verb-te-form",
			list: [{ text: "って", conjugationType: "te", detailId: "verb-te-form" }],
		})
		expect(findCategory(options, "った")).toEqual({
			text: "った",
			detailId: "verb-past",
			list: [{ text: "った", detailId: "verb-past" }],
		})
	})

	test("adds detail to godan categories that select directly instead of opening a submenu", () => {
		const options = getGodanConjugationOptions({
			elementType: "verb",
			verbType: "godan",
			ending: "く",
		})

		expect(findCategory(options, "く")).toEqual(
			expect.objectContaining({ detailId: "verb-non-past" }),
		)
		expect(findCategory(options, "いて")).toEqual(
			expect.objectContaining({ conjugationType: "te", detailId: "verb-te-form" }),
		)
		expect(findCategory(options, "いた")).toEqual(
			expect.objectContaining({ detailId: "verb-past" }),
		)
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
			list: [
				{ text: "ない", detailId: "verb-negative" },
				{ text: "れる", detailId: "verb-passive" },
				{ text: "せる", detailId: "verb-causative" },
				{ text: "ず", detailId: "verb-zu-negative" },
			],
		})
		expect(findCategory(options, "った")).toEqual({
			text: "った",
			detailId: "verb-past",
			list: [{ text: "った", detailId: "verb-past" }],
		})
	})

	test("adds detail to the B2 stem option", () => {
		const options = getGodanConjugationOptions({
			elementType: "verb",
			verbType: "godan-iku",
			ending: "く",
		})

		expect(findCategory(options, "き").list).toEqual(
			expect.arrayContaining([
				{ text: "き", conjugationType: "aux", detailId: "verb-stem" },
			]),
		)
	})
})

describe("getConjugationOptionsForParent", () => {
	test("uses prompt-attached options for generated nested conjugations", () => {
		const promptOptions = [{ text: "せる" }, { text: "れる" }]

		expect(
			getConjugationOptionsForParent({
				stem: "か",
				conjugationOptions: promptOptions,
			}),
		).toBe(promptOptions)
	})

	test("falls back to the local follow-up options table", () => {
		expect(
			getConjugationOptionsForParent({
				stem: "られ",
				ending: "る",
			}),
		).toEqual(expect.arrayContaining([expect.objectContaining({ text: "た" })]))
	})

	test("keeps godan options available after the visible ending changes", () => {
		expect(
			getConjugationOptionsForParent({
				elementType: "verb",
				verbType: "godan-iku",
				baseEnding: "く",
				ending: "か",
			}),
		).toEqual(expect.arrayContaining([expect.objectContaining({ text: "か" })]))
	})
})

describe("getConjugationForm", () => {
	test("hydrates follow-up options from the named option table", () => {
		expect(getConjugationForm("られる")).toEqual(
			expect.objectContaining({
				stem: "られ",
				ending: "る",
				conjugationOptions: expect.arrayContaining([
					expect.objectContaining({ text: "ない" }),
				]),
			}),
		)
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

describe("createConjugationFromForm", () => {
	test("creates a normalized conjugation object", () => {
		expect(
			createConjugationFromForm({
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
