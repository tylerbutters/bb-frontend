import { getConjugationEndingOptions, getConjugationEndingUpdate } from "./ConjugationEnding"

describe("getConjugationEndingUpdate", () => {
	test("preserves te conjugation metadata when changing an existing ending", () => {
		expect(getConjugationEndingUpdate({ text: "して" })).toEqual({
			conjugationType: "te",
			stem: "して",
			ending: "",
			conjugation: {},
		})
	})

	test("preserves nested ending data for conjugations that can continue", () => {
		expect(getConjugationEndingUpdate({ text: "ない" })).toEqual({
			conjugationType: undefined,
			stem: "な",
			ending: "い",
			conjugation: {},
		})
	})

	test("returns an empty update when the selected conjugation is not defined", () => {
		expect(getConjugationEndingUpdate({ text: "missing" })).toEqual({})
	})
})

describe("getConjugationEndingOptions", () => {
	test("uses prompt-attached options before table lookup", () => {
		const promptOptions = [{ text: "た" }]

		expect(
			getConjugationEndingOptions({
				stem: "られ",
				ending: "る",
				conjugationOptions: promptOptions,
			}),
		).toBe(promptOptions)
	})

	test("falls back to the local conjugation table", () => {
		expect(
			getConjugationEndingOptions({
				stem: "られ",
				ending: "る",
			}),
		).toEqual(expect.arrayContaining([expect.objectContaining({ text: "た" })]))
	})
})
