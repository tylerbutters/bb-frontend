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

	test("returns conjugation details for negative te, tari, and zu options", () => {
		expect(getElementDetail({ text: "ないで", detailId: "verb-negative-te-form" })).toMatchObject({
			kind: "conjugation",
			grammaticalName: "Negative te form",
			englishTranslation: "Without doing",
		})
		expect(getElementDetail({ text: "たり", detailId: "verb-tari-form" })).toMatchObject({
			kind: "conjugation",
			grammaticalName: "Tari form",
			englishTranslation: "Do things like",
		})
		expect(getElementDetail({ text: "ず", detailId: "verb-zu-negative" })).toMatchObject({
			kind: "conjugation",
			grammaticalName: "Zu negative",
			englishTranslation: "Without doing / not doing",
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

	test("returns particle details for particle menu options", () => {
		expect(getElementDetail({ elementType: "particle", text: "は" })).toMatchObject({
			kind: "particle",
			type: "Particle",
			text: "は",
			englishTranslation: "topic / contrast",
		})
	})

	test("returns no detail for unsupported options", () => {
		expect(getElementDetail({ elementType: "punctuation", text: "。" })).toBeNull()
	})
})
