import { japaneseTranslationToElements } from "./japaneseTranslationElements"

describe("japaneseTranslationToElements", () => {
	test("looks up Japanese words and attaches noun particles", () => {
		expect(
			japaneseTranslationToElements([
				{ kanji: "私", kana: "わたし", particle: "は" },
				{ kanji: "寿司", kana: "すし", particle: "を" },
				{ kanji: "食べる", kana: "たべる" },
			]),
		).toEqual([
			expect.objectContaining({
				elementType: "noun",
				text: "私",
				textKana: "わたし",
				particle: {
					elementType: "particle",
					text: "は",
				},
			}),
			expect.objectContaining({
				elementType: "noun",
				text: "寿司",
				textKana: "すし",
				particle: {
					elementType: "particle",
					text: "を",
				},
			}),
			expect.objectContaining({
				elementType: "verb",
				text: "食べる",
				textKana: "たべる",
				conjugation: {
					stem: "る",
				},
			}),
		])
	})

	test("skips words that are not in the local dictionary", () => {
		expect(
			japaneseTranslationToElements([
				{ kanji: "見つからない言葉", kana: "みつからないことば" },
				{ kanji: "行く", kana: "いく" },
			]),
		).toEqual([
			expect.objectContaining({
				elementType: "verb",
				text: "行く",
				textKana: "いく",
			}),
		])
	})
})
