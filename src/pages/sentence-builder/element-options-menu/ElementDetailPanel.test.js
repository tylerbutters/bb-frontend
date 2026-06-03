import { render, screen } from "@testing-library/react"
import ElementDetailPanel, { getElementDetail } from "./ElementDetailPanel"

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

	test("shows conjugation example arrows as right arrows", () => {
		render(<ElementDetailPanel element={{ text: "ない" }} isOpen />)

		expect(screen.getByText("食べる → 食べない")).toBeInTheDocument()
		expect(screen.queryByText("食べる => 食べない")).not.toBeInTheDocument()
		expect(screen.queryByText("(食べない)")).not.toBeInTheDocument()
	})
})
