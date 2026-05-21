import { getConjugationEndingUpdate } from "./ConjugationEnding"

describe("getConjugationEndingUpdate", () => {
	test("preserves te conjugation metadata when changing an existing ending", () => {
		expect(
			getConjugationEndingUpdate(
				{
					して: {
						stem: "して",
						conjugationType: "te",
					},
				},
				{ text: "して" },
			),
		).toEqual({
			conjugationType: "te",
			stem: "して",
			ending: "",
			conjugation: {},
		})
	})

	test("preserves nested ending data for conjugations that can continue", () => {
		expect(
			getConjugationEndingUpdate(
				{
					ない: {
						stem: "な",
						ending: "い",
						conjugationOptions: [{ text: "かった" }],
					},
				},
				{ text: "ない" },
			),
		).toEqual({
			conjugationType: undefined,
			stem: "な",
			ending: "い",
			conjugation: {},
		})
	})

	test("returns an empty update when the selected conjugation is not defined", () => {
		expect(getConjugationEndingUpdate({}, { text: "missing" })).toEqual({})
	})
})
