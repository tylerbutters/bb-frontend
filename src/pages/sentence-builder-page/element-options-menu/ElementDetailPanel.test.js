import { getElementDetail } from "./ElementDetailPanel"

describe("getElementDetail", () => {
	test("returns conjugation details for conjugation menu options", () => {
		expect(getElementDetail({ text: "させる" })).toMatchObject({
			kind: "conjugation",
			type: "Verb Conjugation",
			grammaticalName: "Causative",
			englishTranslation: "To make / let / have somebody do something",
		})
	})

	test("formats vocabulary details from processed JMdict entries", () => {
		expect(
			getElementDetail({
				elementType: "noun",
				text: "学校",
				textKana: "がっこう",
				meanings: ["school"],
			}),
		).toMatchObject({
			kind: "vocabulary",
			type: "Noun",
			word: "学校",
			kana: "がっこう",
			romaji: "gakkou",
			translations: ["school"],
		})
	})

	test("returns no detail for particles and unsupported options", () => {
		expect(getElementDetail({ elementType: "particle", text: "は" })).toBeNull()
	})
})
