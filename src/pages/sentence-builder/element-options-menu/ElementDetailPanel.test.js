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

	test("shows conjugation example arrows as right arrows", () => {
		const { container } = render(<ElementDetailPanel element={{ text: "ない" }} isOpen />)

		expect(container).toHaveTextContent("食べる → 食べない")
		expect(container).not.toHaveTextContent("食べる => 食べない")
		expect(screen.queryByText("(食べない)")).not.toBeInTheDocument()
	})

	test("bolds only the changed endings in conjugation examples", () => {
		const { container } = render(<ElementDetailPanel element={{ text: "ない" }} isOpen />)
		const getEndingTexts = (exampleText) => {
			const exampleLine = Array.from(
				container.querySelectorAll(".elementDetailExamples > div"),
			).find((line) => line.textContent === exampleText)

			return Array.from(
				exampleLine?.querySelectorAll(".elementDetailConjugationEnding") || [],
			).map((ending) => ending.textContent)
		}

		expect(getEndingTexts("食べる → 食べない")).toEqual(["る", "ない"])
		expect(getEndingTexts("書く → 書かない")).toEqual(["く", "かない"])
	})

	test("uses structured conjugation example data", () => {
		const detail = getElementDetail({ text: "ない" })
		const godanConstruction = detail.constructions.find(
			(construction) => construction.label === "Godan",
		)

		expect(godanConstruction.examples).toContainEqual({
			base: "書く",
			conjugation: "書かない",
		})
		expect(godanConstruction.examples).not.toContain("書く → 書かない")
	})
})
