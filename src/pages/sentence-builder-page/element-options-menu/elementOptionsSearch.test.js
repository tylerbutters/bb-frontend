import { filterElementOptions } from "./elementOptionsSearch"

describe("filterElementOptions", () => {
	const options = [
		{
			text: "走る",
			textKana: "はしる",
			meanings: ["to run"],
		},
		{
			text: "食べる",
			textKana: "たべる",
			meanings: ["to eat"],
		},
		{
			text: "学校",
			textKana: "がっこう",
			meanings: ["school"],
		},
		{
			text: "見せる",
			textKana: "みせる",
			meanings: ["to show", "to display"],
		},
	]

	test("returns no options until the user enters a query", () => {
		expect(filterElementOptions(options, "")).toEqual([])
		expect(filterElementOptions(options, "   ")).toEqual([])
	})

	test("matches by kana converted to romaji", () => {
		expect(filterElementOptions(options, "taberu")).toEqual([options[1]])
		expect(filterElementOptions(options, "gakkou")).toEqual([options[2]])
	})

	test("matches by word meaning", () => {
		expect(filterElementOptions(options, "school")).toEqual([options[2]])
		expect(filterElementOptions(options, "display")).toEqual([options[3]])
	})

	test("ranks starts-with matches before includes matches", () => {
		const rankedOptions = [
			{ text: "A", meanings: ["xxeat"] },
			{ text: "B", meanings: ["eat"] },
			{ text: "C", meanings: ["to eat"] },
		]

		expect(filterElementOptions(rankedOptions, "eat")).toEqual([
			rankedOptions[1],
			rankedOptions[2],
			rankedOptions[0],
		])
	})

	test("preserves original order for equal-rank matches", () => {
		const sameRankOptions = [
			{ text: "猫", textKana: "ねこ", meanings: ["cat"] },
			{ text: "猫達", textKana: "ねこたち", meanings: ["cats"] },
		]

		expect(filterElementOptions(sameRankOptions, "neko")).toEqual(sameRankOptions)
	})
})
