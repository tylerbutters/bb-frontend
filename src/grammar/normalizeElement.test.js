import normalizeElement from "./normalizeElement"

describe("normalizeElement", () => {
	test("initializes verbs with their ending as the first conjugation stem", () => {
		expect(
			normalizeElement({
				elementType: "verb",
				stem: "食べ",
				ending: "る",
			}),
		).toMatchObject({
			conjugation: { stem: "る" },
		})
	})

	test("initializes i-adjectives and desu", () => {
		expect(
			normalizeElement({
				elementType: "adjective",
				adjectiveType: "i-type",
				stem: "高",
				ending: "い",
			}),
		).toMatchObject({
			conjugation: { stem: "い" },
		})

		expect(
			normalizeElement({
				elementType: "desu",
				stem: "だ",
			}),
		).toMatchObject({
			conjugation: { stem: "だ" },
		})
	})

	test("defaults missing counter numbers to zero", () => {
		expect(
			normalizeElement({
				elementType: "counter",
				text: "個",
			}),
		).toMatchObject({
			number: "0",
		})
	})

	test("preserves existing counter numbers", () => {
		expect(
			normalizeElement({
				elementType: "counter",
				number: "12",
				text: "個",
			}),
		).toMatchObject({
			number: "12",
		})
	})
})
