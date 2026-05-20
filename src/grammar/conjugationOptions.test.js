import { getGodanConjugationOptions } from "./conjugationOptions"

test("puts aru negative at the top level as a parent replacement", () => {
	const options = getGodanConjugationOptions({
		verbType: "godan",
		text: "有る",
		textKana: "ある",
		ending: "る",
	})

	expect(options.find((option) => option.text === "ない")).toMatchObject({
		replacesParent: true,
	})
	expect((options.find((option) => option.text === "ら")?.list || []).some(
		(option) => option.text === "ない",
	)).toBe(false)
})

test("keeps regular ru godan negative as a normal b1 option", () => {
	const options = getGodanConjugationOptions({
		verbType: "godan",
		text: "帰る",
		textKana: "かえる",
		ending: "る",
	})
	const b1Options = options.find((option) => option.text === "ら")?.list || []

	expect(b1Options.find((option) => option.text === "ない")).not.toHaveProperty(
		"replacesParent",
	)
})

test("keeps aru conjugation options available after its displayed ending changes", () => {
	const options = getGodanConjugationOptions({
		verbType: "godan",
		text: "有る",
		textKana: "ある",
		ending: "り",
	})

	expect(options.find((option) => option.text === "ない")).toMatchObject({
		replacesParent: true,
	})
	expect(options.find((option) => option.text === "り")?.list).toEqual(
		expect.arrayContaining([{ text: "ます" }]),
	)
})
