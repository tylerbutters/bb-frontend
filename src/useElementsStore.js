import { create } from "zustand"

const useElementsStore = create((set) => ({
	adjective: [
		{ value: "大きい", type: "adjective" },
		{ value: "小さい", type: "adjective" },
		{ value: "高い", type: "adjective" },
		{ value: "安い", type: "adjective" },
		{ value: "新しい", type: "adjective" },
	],
	noun: [
		{ value: "人", type: "noun" },
		{ value: "本", type: "noun" },
		{ value: "学校", type: "noun" },
		{ value: "水", type: "noun" },
		{ value: "食べ物", type: "noun" },
	],
	prefix: [
		{ value: "お", type: "prefix" },
		{ value: "ご", type: "prefix" },
		{ value: "大", type: "prefix" },
		{ value: "小", type: "prefix" },
		{ value: "真", type: "prefix" },
	],
	suffix: [
		{ value: "間", type: "suffix" },
		{ value: "中", type: "suffix" },
		{ value: "後", type: "suffix" },
		{ value: "前", type: "suffix" },
		{ value: "回", type: "suffix" },
	],
	particle: [
		{ value: "は", type: "particle" },
		{ value: "が", type: "particle" },
		{ value: "を", type: "particle" },
		{ value: "に", type: "particle" },
		{ value: "で", type: "particle" },
	],
	conjugations: {
		//kuru
		くる: {
			stem: "くる",
			ending: null,
			conjugationOptions: [
				"こない",
				"くれば",
				"こられる",
				"こい",
				"こよう",
				"たら",
				"こさせる",
				"きて",
				"きた",
				"きます",
				"きたい",
			],
		},
		こない: {
			stem: "こな",
			ending: "い",
			conjugationOptions: ["い", "かった"],
		},
		きた: {
			stem: "きた",
			ending: null,
			conjugationOptions: [],
		},
		きて: {
			stem: "して",
			ending: null,
			conjugationOptions: [],
		},
		きたい: {
			stem: "きた",
			ending: "い",
			conjugationOptions: ["くない", "かった"],
		},
		こられる: {
			stem: "こられ",
			ending: "る",
			conjugationOptions: ["ない", "たい", "た", "たり", "て", "よう", "ます", "ず"],
		},
		こよう: {
			stem: "こよう",
			ending: null,
			conjugationOptions: [],
		},
		きます: {
			stem: "きま",
			ending: "す",
			conjugationOptions: ["せん", "した", "して"],
		},
		くれば: {
			stem: "くれば",
			ending: null,
			conjugationOptions: [],
		},
		こさせる: {
			stem: "こさせ",
			ending: "る",
			conjugationOptions: ["ない", "ます", "た", "よう", "られる"],
		},
		//suru
		する: {
			stem: "する",
			ending: null,
			conjugationOptions: [
				"した",
				"します",
				"して",
				"される",
				"させる",
				"できる",
				"しない",
				"する",
				"したい",
				"しよう",
				"ます",
				"せず",
				"すれば",
			],
		},
		される: {
			stem: "され",
			ending: "る",
			conjugationOptions: ["ない", "ます", "た", "よう"],
		},
		しない: {
			stem: "しな",
			ending: "い",
			conjugationOptions: ["い", "かった"],
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
			conjugationOptions: [],
		},
		したい: {
			stem: "した",
			ending: "い",
			conjugationOptions: ["くない", "かった"],
		},
		できる: {
			stem: "でき",
			ending: "る",
			conjugationOptions: ["ない", "たい", "た", "たり", "て", "よう", "ます", "ず"],
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
			conjugationOptions: ["ない", "ます", "た", "よう", "られる"],
		},
		//ichidan
		ichidanDefault: {
			stem: "る",
			ending: null,
			conjugationOptions: [
				"ない",
				"たい",
				"た",
				"たり",
				"て",
				"られる",
				"させる",
				"よう",
				"ます",
				"ず",
			],
		},
		られる: {
			stem: "られ",
			ending: "る",
			conjugationOptions: ["ない", "たい"],
		},
		れば: {
			stem: "れば",
			ending: null,
			conjugationOptions: [],
		},
		//godan
		godanDefaults: {
			B1: ["ない", "れる", "せる", "ず"],
			B2: ["ます"],
			B3: [],
			B4: ["ば", "る", "れ"],
			B5: ["う"],
			Bte: [],
			Bta: [],
		},
		る: {
			stem: null,
			ending: "る",
			conjugationOptions: ["ない", "ます", "た", "よう"],
		},
		れる: {
			stem: "れ",
			ending: "る",
			conjugationOptions: ["ない", "ます", "た", "よう"],
		},
		せる: {
			stem: "せ",
			ending: "る",
			conjugationOptions: ["ない", "たい", "た", "たり", "て", "よう", "ます", "ず", "られる"],
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
			conjugationOptions: ["かった", "くて", "く"],
		},
		たい: {
			stem: "た",
			ending: "い",
			conjugationOptions: ["くない", "かった", "くて", "く"],
		},
		ず: {
			stem: "ず",
			ending: null,
			conjugationOptions: [],
		},
		くて: {
			stem: "くて",
			ending: null,
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
			conjugationOptions: ["かった", "くて"],
		},

		かった: {
			stem: "かった",
			ending: null,
			conjugationOptions: [],
		},

		ます: {
			stem: "ま",
			ending: "す",
			conjugationOptions: ["した", "せん", "して"],
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
	adjectiveConjugations: ["くない", "かった", "くなかった", "く"],
	punctuation: ["、", "。"],
	coupla: ["だ", "です"],
}))

export default useElementsStore
