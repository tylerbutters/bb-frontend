import { conjugations } from "../grammar/elementData"
import { getConjugationOptionsForParent } from "./Conjugation"

describe("getConjugationOptionsForParent", () => {
	test("uses prompt-attached options for generated nested conjugations", () => {
		const promptOptions = [{ text: "せる" }, { text: "れる" }]

		expect(
			getConjugationOptionsForParent(
				{
					stem: "か",
					conjugationOptions: promptOptions,
				},
				conjugations,
			),
		).toBe(promptOptions)
	})

	test("falls back to the local conjugation table", () => {
		expect(
			getConjugationOptionsForParent(
				{
					stem: "られ",
					ending: "る",
				},
				conjugations,
			),
		).toEqual(expect.arrayContaining([{ text: "た" }]))
	})

	test("keeps godan options available after the visible ending changes", () => {
		expect(
			getConjugationOptionsForParent(
				{
					elementType: "verb",
					verbType: "godan-iku",
					baseEnding: "く",
					ending: "か",
				},
				conjugations,
			),
		).toEqual(expect.arrayContaining([expect.objectContaining({ text: "か" })]))
	})
})
