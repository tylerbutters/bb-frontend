import { create } from "zustand"

const rareruOptions = [
	{ text: "る" },
	{ text: "ない" },
	{ text: "たい" },
	{ text: "た" },
	{ text: "たり" },
	{ text: "て" },
	{ text: "よう" },
	{ text: "ます" },
	{ text: "ず" },
]

const saseruOptions = [
	{ text: "る" },
	{ text: "ない" },
	{ text: "たい" },
	{ text: "ます" },
	{ text: "た" },
	{ text: "たり" },
	{ text: "て" },
	{ text: "よう" },
	{ text: "られる" },
	{ text: "ず" },
]

const masuOptions = [{ text: "せん" }, { text: "した" }, { text: "して" }]

const iadjOptions = [
	{ text: "い" },
	{ text: "くない" },
	{ text: "かった" },
	{ text: "く" },
	{ text: "くて" },
]

const kunaiOptions = [{ text: "い" }, { text: "かった" }, { text: "く" }, { text: "くて" }]

const useElementsStore = create((set) => ({
	auxiliaries: [
		{ text: "始める", elementType: "verb" },
		{ text: "終わる", elementType: "verb" },
		{ text: "続ける", elementType: "verb" },
		{ text: "やすい", elementType: "adjective" },
		{ text: "にくい", elementType: "adjective" },
		{ text: "すぎる", elementType: "verb" },
		{ text: "直す", elementType: "verb" },
		{ text: "切る", elementType: "verb" },
		{ text: "出す", elementType: "verb" },
		{ text: "合う", elementType: "verb" },
		{ text: "慣れる", elementType: "verb" },
		{ text: "忘れる", elementType: "verb" },
		{ text: "残す", elementType: "verb" },
		{ text: "疲れる", elementType: "verb" },
		{ text: "比べる", elementType: "verb" },
	],
	particles: [
		{
			text: "から",
			attachesTo: ["noun", "verb", "te-form"],
		},
		{
			text: "は",
			attachesTo: ["noun", "verb", "te-form"],
		},
		{
			text: "も",
			attachesTo: ["noun", "verb", "te-form"],
		},
		{
			text: "が",
			attachesTo: ["noun", "verb"],
		},
		{
			text: "を",
			attachesTo: ["noun"],
		},
		{
			text: "に",
			attachesTo: ["noun", "verb"],
		},
		{
			text: "へ",
			attachesTo: ["noun"],
		},
		{
			text: "で",
			attachesTo: ["noun", "te-form"],
		},
		{
			text: "と",
			attachesTo: ["noun", "verb", "i-type", "na-type"],
		},
		{
			text: "こそ",
			attachesTo: ["noun", "verb"],
		},
		{
			text: "さえ",
			attachesTo: ["noun", "verb"],
		},
		{
			text: "しか",
			attachesTo: ["noun", "verb"],
		},
		{
			text: "ばかり",
			attachesTo: ["noun", "verb"],
		},
		{
			text: "だけ",
			attachesTo: ["noun", "verb", "i-type", "na-type"],
		},
		{
			text: "のみ",
			attachesTo: ["noun", "verb", "i-type", "na-type"],
		},
		{
			text: "の",
			attachesTo: ["noun"],
		},
		{
			text: "な",
			attachesTo: ["na-type"],
		},
	],
	conjugations: {
		iadjectives: {
			default: {
				stem: "い",
				ending: null,
				conjugationOptions: iadjOptions,
			},
			くない: {
				stem: "くな",
				ending: "い",
				conjugationOptions: kunaiOptions,
			},
		},
		verbs: {
			//kuru
			kuruDefault: {
				stem: "くる",
				ending: null,
				conjugationOptions: [
					{ text: "きて" },
					{ text: "きた" },
					{ text: "きます" },
					{ text: "きたい" },
					{ text: "きたら" },
					{ text: "くれば" },
					{ text: "くる" },
					{ text: "こない" },
					{ text: "こられる" },
					{ text: "こい" },
					{ text: "こよう" },
					{ text: "こさせる" },
					{ text: "こず" },
					{ text: "き" },
				],
			},
			き: {
				stem: "き",
				conjugationType: "aux",
			},
			こない: {
				stem: "こな",
				ending: "い",
				conjugationOptions: iadjOptions,
			},
			きた: {
				stem: "きた",
				ending: null,
				conjugationOptions: [],
			},
			きて: {
				stem: "きて",
				ending: null,
				conjugationType: "te",
				conjugationOptions: [],
			},
			きたい: {
				stem: "きた",
				ending: "い",
				conjugationOptions: iadjOptions,
			},
			こられる: {
				stem: "こられ",
				ending: "る",
				conjugationOptions: rareruOptions,
			},
			こよう: {
				stem: "こよう",
				ending: null,
				conjugationOptions: [],
			},
			きます: {
				stem: "きま",
				ending: "す",
				conjugationOptions: masuOptions,
			},
			くれば: {
				stem: "くれば",
				ending: null,
				conjugationOptions: [],
			},
			こさせる: {
				stem: "こさせ",
				ending: "る",
				conjugationOptions: saseruOptions,
			},
			こず: {
				stem: "こず",
				ending: null,
				conjugationOptions: [],
			},
			//suru
			suruDefault: {
				stem: "する",
				ending: null,
				conjugationOptions: [
					{ text: "される" },
					{ text: "させる" },
					{ text: "した" },
					{ text: "します" },
					{ text: "して" },
					{ text: "しない" },
					{ text: "したい" },
					{ text: "しよう" },
					{ text: "する" },
					{ text: "すれば" },
					{ text: "せず" },
					{ text: "できる" },
					{ text: "し" },
				],
			},
			し: {
				stem: "し",
				conjugationType: "aux",
			},
			される: {
				stem: "され",
				ending: "る",
				conjugationOptions: saseruOptions,
			},
			しない: {
				stem: "しな",
				ending: "い",
				conjugationOptions: iadjOptions,
			},
			した: {
				stem: "した",
				ending: null,
				conjugationOptions: [],
			},
			すれば: {
				stem: "すれば",
				ending: null,
				conjugationOptions: [],
			},
			して: {
				stem: "して",
				ending: null,
				conjugationType: "te",
				conjugationOptions: [],
			},
			したい: {
				stem: "した",
				ending: "い",
				conjugationOptions: iadjOptions,
			},
			できる: {
				stem: "でき",
				ending: "る",
				conjugationOptions: rareruOptions,
			},
			しよう: {
				stem: "しよう",
				ending: null,
				conjugationOptions: [],
			},
			せず: {
				stem: "せず",
				ending: null,
				conjugationOptions: [],
			},
			//suru and ichidan
			させる: {
				stem: "させ",
				ending: "る",
				conjugationOptions: saseruOptions,
			},
			//ichidan
			ichidanDefault: {
				stem: "る",
				ending: null,
				conjugationOptions: [
					{ text: "ない" },
					{ text: "たい" },
					{ text: "た" },
					{ text: "る" },
					{ text: "たり" },
					{ text: "て" },
					{ text: "られる" },
					{ text: "させる" },
					{ text: "よう" },
					{ text: "ます" },
					{ text: "ず" },
					{ text: "blank" },
				],
			},
			blank: {
				// stem: "",
				conjugationType: "aux",
			},
			られる: {
				stem: "られ",
				ending: "る",
				conjugationOptions: rareruOptions,
			},
			れば: {
				stem: "れば",
				ending: null,
				conjugationOptions: [],
			},
			//godan
			る: {
				stem: null,
				ending: "る",
				conjugationOptions: rareruOptions,
			},
			れる: {
				stem: "れ",
				ending: "る",
				conjugationOptions: rareruOptions,
			},
			せる: {
				stem: "せ",
				ending: "る",
				conjugationOptions: saseruOptions,
			},
			う: {
				stem: "う",
				ending: null,
				conjugationOptions: [],
			},
			ば: {
				stem: "ば",
				ending: null,
				conjugationOptions: [],
			},
			//ichidan and godan
			ない: {
				stem: "な",
				ending: "い",
				conjugationOptions: iadjOptions,
			},
			たい: {
				stem: "た",
				ending: "い",
				conjugationOptions: iadjOptions,
			},
			ず: {
				stem: "ず",
				ending: null,
				conjugationOptions: [],
			},
			くて: {
				stem: "くて",
				ending: null,
				conjugationType: "te",
				conjugationOptions: [],
			},
			た: {
				stem: "た",
				ending: null,
				conjugationOptions: [],
			},

			て: {
				stem: "て",
				ending: null,
				conjugationType: "te",
				conjugationOptions: [],
			},

			く: {
				stem: "く",
				ending: null,
				conjugationOptions: [],
			},

			くない: {
				stem: "くな",
				ending: "い",
				conjugationOptions: kunaiOptions,
			},

			かった: {
				stem: "かった",
				ending: null,
				conjugationOptions: [],
			},

			ます: {
				stem: "ま",
				ending: "す",
				conjugationOptions: masuOptions,
			},
			せん: {
				stem: "せん",
				ending: null,
				conjugationOptions: [],
			},
			よう: {
				stem: "よう",
				ending: null,
				conjugationOptions: [],
			},
		},
		nodesu: {
			の: {
				stem: "の",
				ending: null,
				conjugationOptions: [],
			},
			なの: {
				stem: "なの",
				ending: null,
				conjugationOptions: [],
			},
			ん: {
				stem: "ん",
				ending: null,
				type: null,
				conjugationOptions: [],
			},
			なん: {
				stem: "なん",
				ending: null,
				conjugationOptions: [],
			},
		},
		desu: {
			だ: {
				stem: "だ",
				ending: null,
				conjugationOptions: ["だった、で、です"],
			},
			だった: {
				stem: "だった",
				ending: null,
				conjugationOptions: [],
			},
			で: {
				stem: "で",
				ending: null,
				type: "te",
				conjugationOptions: [],
			},
			です: {
				stem: "で",
				ending: "す",
				conjugationOptions: masuOptions,
			},
		},
	},
}))

export default useElementsStore
