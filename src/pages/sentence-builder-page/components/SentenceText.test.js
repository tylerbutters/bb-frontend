import { render, screen, waitFor } from "@testing-library/react"
import SentenceText, {
	elementsToTextParts,
	textPartsToString,
	translateJapanese,
} from "./SentenceText"

describe("sentence text conversion", () => {
	test("builds text parts for nouns with prefix, suffix, and particle", () => {
		expect(
			elementsToTextParts([
				{
					elementType: "noun",
					prefix: { text: "お", textKana: "お" },
					text: "茶",
					textKana: "ちゃ",
					suffix: { text: "さん", textKana: "さん" },
					particle: { text: "は" },
				},
			]),
		).toEqual([
			{ text: "お", reading: "お" },
			{ text: "茶", reading: "ちゃ" },
			{ text: "さん", reading: "さん" },
			{ text: "は", reading: undefined },
		])
	})

	test("builds text parts for godan verbs without duplicating the selected stem", () => {
		expect(
			elementsToTextParts([
				{
					elementType: "verb",
					verbType: "godan-u",
					stem: "買",
					stemKana: "か",
					ending: "い",
					conjugation: {
						stem: "い",
						conjugation: {
							stem: "ます",
							conjugation: {},
						},
					},
				},
			]),
		).toEqual([
			{ text: "買", reading: "か" },
			{ text: "い", reading: undefined },
			{ text: "ます", reading: undefined },
		])
	})

	test("uses replacement conjugation text for aru's special negative", () => {
		const parts = elementsToTextParts([
			{
				elementType: "verb",
				verbType: "godan-aru",
				stem: "あ",
				ending: "る",
				conjugation: {
					replacesParent: true,
					stem: "な",
					ending: "い",
					conjugation: {},
				},
			},
		])

		expect(parts).toEqual([
			{ text: "な", reading: undefined },
			{ text: "い", reading: undefined },
		])
		expect(textPartsToString(parts)).toBe("ない")
	})

	test("turns text parts into a sentence string", () => {
		expect(
			textPartsToString([{ text: "猫", reading: "ねこ" }, { text: "が" }, { text: "いる" }]),
		).toBe("猫がいる")
	})

	test("uses the current counter number in the sentence string", () => {
		const parts = elementsToTextParts([
			{
				elementType: "counter",
				number: "12",
				text: "個",
				textKana: "こ",
			},
		])

		expect(parts).toEqual([
			{ text: "12", reading: undefined },
			{ text: "個", reading: "こ" },
		])
		expect(textPartsToString(parts)).toBe("12個")
	})
})

describe("translateJapanese", () => {
	afterEach(() => {
		jest.restoreAllMocks()
		delete global.fetch
	})

	test("returns joined translated text from the translation API response", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "I eat" }),
		})

		await expect(translateJapanese("食べる")).resolves.toBe("I eat")
		expect(global.fetch).toHaveBeenCalledWith("/games/sandbox/translate-japanese", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ text: "食べる" }),
		})
	})
})

describe("SentenceText", () => {
	afterEach(() => {
		jest.restoreAllMocks()
		delete global.fetch
	})

	test("renders Japanese text with furigana and the translated sentence", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({ translation: "The cat eats." }),
		})

		render(
			<SentenceText
				addedElements={[
					{
						elementType: "noun",
						text: "猫",
						textKana: "ねこ",
						particle: { text: "が" },
					},
					{
						elementType: "verb",
						stem: "食べ",
						stemKana: "たべ",
						ending: "る",
						conjugation: { stem: "る", conjugation: {} },
					},
					{ elementType: "punctuation", text: "。" },
				]}
			/>,
		)

		expect(screen.getByText("猫")).toBeInTheDocument()
		expect(screen.getByText("ねこ")).toBeInTheDocument()
		expect(screen.getByText("食べ")).toBeInTheDocument()
		expect(screen.getByText("たべ")).toBeInTheDocument()

		await waitFor(() => {
			expect(screen.getByText("The cat eats.")).toBeInTheDocument()
		})
	})

	test("does not call the translation API for an empty sentence", async () => {
		global.fetch = jest.fn()

		render(<SentenceText addedElements={[]} />)

		await waitFor(() => {
			expect(global.fetch).not.toHaveBeenCalled()
		})
	})
})
