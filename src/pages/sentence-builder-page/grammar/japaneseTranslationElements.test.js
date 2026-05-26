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

	test("does not attach prompt particles to verbs", () => {
		expect(
			japaneseTranslationToElements([{ kanji: "行く", kana: "いく", particle: "を" }]),
		).toEqual([
			expect.objectContaining({
				elementType: "verb",
				text: "行く",
				textKana: "いく",
				particle: null,
			}),
		])
	})

	test("resolves prompt conjugation types through the local conjugation table", () => {
		const [element] = japaneseTranslationToElements([
			{
				kanji: "食べる",
				kana: "たべる",
				conjugation: ["passive", "past"],
			},
		])

		expect(element).toEqual(
			expect.objectContaining({
				elementType: "verb",
				text: "食べる",
				textKana: "たべる",
				conjugation: expect.objectContaining({
					stem: "られ",
					ending: "る",
					conjugationOptions: expect.any(Array),
					conjugation: {
						stem: "た",
						conjugation: {},
					},
				}),
			}),
		)
		expect(element.conjugation.conjugation.ending).toBeUndefined()
	})

	test("resolves prompt godan category conjugations without adding empty endings", () => {
		const [element] = japaneseTranslationToElements([
			{
				kanji: "読む",
				kana: "よむ",
				conjugation: ["past"],
			},
		])

		expect(element).toEqual(
			expect.objectContaining({
				elementType: "verb",
				text: "読む",
				textKana: "よむ",
				ending: "んだ",
				conjugation: {
					stem: "んだ",
					conjugationOptions: [{ text: "んだ" }],
					conjugation: {},
				},
			}),
		)
		expect(element.conjugation.ending).toBeUndefined()
		expect(element.baseEnding).toBe("む")
	})

	test("keeps generated godan conjugation chains editable", () => {
		const [element] = japaneseTranslationToElements([
			{
				kanji: "行く",
				kana: "いく",
				conjugation: ["causative", "passive", "past"],
			},
		])

		expect(element.conjugation).toEqual(
			expect.objectContaining({
				stem: "せ",
				ending: "る",
				conjugationOptions: expect.arrayContaining([{ text: "られる" }]),
				conjugation: expect.objectContaining({
					stem: "られ",
					ending: "る",
					conjugationOptions: expect.arrayContaining([{ text: "た" }]),
					conjugation: expect.objectContaining({
						stem: "た",
						conjugation: {},
					}),
				}),
			}),
		)
		expect(element.ending).toBe("か")
		expect(element.baseEnding).toBe("く")
	})

	test("normalizes semantic past by verb type", () => {
		const elements = japaneseTranslationToElements([
			{
				kanji: "勉強する",
				kana: "べんきょうする",
				conjugation: ["past"],
			},
			{
				kanji: "食べる",
				kana: "たべる",
				conjugation: ["past"],
			},
			{
				kanji: "買う",
				kana: "かう",
				conjugation: ["past"],
			},
			{
				kanji: "読む",
				kana: "よむ",
				conjugation: ["past"],
			},
		])

		expect(elements.map((element) => element.conjugation.stem)).toEqual([
			"した",
			"た",
			"った",
			"んだ",
		])
		expect(elements.map((element) => element.conjugation.ending)).toEqual([
			undefined,
			undefined,
			undefined,
			undefined,
		])
	})
})
