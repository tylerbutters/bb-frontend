import { create } from "zustand"

const useElementsStore = create((set) => ({
	verb: ["食べる", "飲む", "行く", "来る", "見る", "する", "話す", "書く", "読む", "寝る"],
	adjective: [
		"大きい",
		"小さい",
		"高い",
		"安い",
		"新しい",
		"古い",
		"いい",
		"悪い",
		"面白い",
		"忙しい",
	],
	noun: ["人", "本", "学校", "水", "食べ物", "日本", "車", "時間", "友達", "言葉"],
	prefix: [
		"お",
		"ご",
		"大",
		"小",
		"真",
		"新",
		"旧",
		"不",
		"無",
		"未",
		"再",
		"反",
		"前",
		"後",
		"最",
		"超",
		"極",
		"多",
		"少",
	],
	suffix: ["間", "中", "後", "前", "回"],
	particle: ["は", "が", "を", "に", "で", "の", "と", "も", "へ", "から"],

	conjugations: {
		//suru
		する: {
			stem: "する",
			ending: null,
			conjugationOptions: [
				"した",
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
			B4: ["ば", "る"],
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
