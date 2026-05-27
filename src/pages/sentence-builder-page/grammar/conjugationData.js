import verbs from "../jmdict/processed/verbs.json"
import adjectives from "../jmdict/processed/adjectives.json"

function textOptions(items, elementType) {
	return items.map((text) => ({ text, ...(elementType && { elementType }) }))
}

const rareruOptions = textOptions([
	"る",
	"ない",
	"ないで",
	"たい",
	"た",
	"たり",
	"て",
	"よう",
	"ます",
	"ず",
])

const saseruOptions = textOptions([
	"る",
	"ない",
	"ないで",
	"たい",
	"ます",
	"た",
	"たり",
	"て",
	"よう",
	"られる",
	"ず",
])

const masuOptions = textOptions(["ます", "せん", "した", "して", "しょう"])

const iadjOptions = textOptions(["い", "くない", "かった", "く", "くて"])

const kunaiOptions = textOptions(["い", "かった", "く", "くて"])

export const godanRows = {
	く: ["か", "き", "く", "け", "こ", "いて", "いた"],
	ぐ: ["が", "ぎ", "ぐ", "げ", "ご", "いで", "いだ"],
	す: ["さ", "し", "す", "せ", "そ", "して", "した"],
	ぶ: ["ば", "び", "ぶ", "べ", "ぼ", "んで", "んだ"],
	む: ["ま", "み", "む", "め", "も", "んで", "んだ"],
	ぬ: ["な", "に", "ぬ", "ね", "の", "んで", "んだ"],
	る: ["ら", "り", "る", "れ", "ろ", "って", "った"],
	つ: ["た", "ち", "つ", "て", "と", "って", "った"],
	う: ["わ", "い", "う", "え", "お", "って", "った"],
}

export const godanDefaults = {
	B1: textOptions(["ない", "れる", "せる", "ず"]),
	B2: textOptions(["ます", "たい"]),
	B4: textOptions(["ば", "る", "れ"]),
	B5: textOptions(["う"]),
}

export const auxiliaryDefinitions = [
	...textOptions(
		[
			"始める",
			"終わる",
			"続ける",
			"すぎる",
			"直す",
			"切る",
			"出す",
			"合う",
			"慣れる",
			"忘れる",
			"残す",
			"疲れる",
			"比べる",
		],
		"verb",
	),
	...textOptions(["やすい", "にくい"], "adjective"),
]

function formatAuxiliaryDefinitions() {
	return auxiliaryDefinitions
		.map((aux) => {
			if (aux.elementType === "verb") {
				return verbs.find((verb) => verb.text === aux.text || verb.textKana === aux.text)
			} else if (aux.elementType === "adjective") {
				return adjectives.find((adj) => adj.text === aux.text || adj.textKana === aux.text)
			}
			return null
		})
		.filter(Boolean)
}

export const auxiliaries = formatAuxiliaryDefinitions()

export const noDesu = textOptions(["の", "なの", "ん", "なん"])

export const conjugations = {
	// kuru
	kuruDefault: textOptions([
		"きて",
		"きた",
		"きたり",
		"きます",
		"きたい",
		"きたら",
		"くれば",
		"くる",
		"こない",
		"こないで",
		"こられる",
		"こい",
		"こよう",
		"こさせる",
		"こず",
		"き",
	]),
	き: {
		stem: "き",
		conjugationType: "aux",
	},
	くる: {
		stem: "くる",
	},
	こない: {
		stem: "こな",
		ending: "い",
		conjugationOptions: iadjOptions,
	},
	きた: {
		stem: "きた",
	},
	きたり: {
		stem: "きたり",
	},
	こないで: {
		stem: "こないで",
		conjugationType: "te",
		conjugationOptions: iadjOptions,
	},
	きて: {
		stem: "きて",
		conjugationType: "te",
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
	},
	きます: {
		stem: "きま",
		ending: "す",
		conjugationOptions: masuOptions,
	},
	くれば: {
		stem: "くれば",
	},
	こさせる: {
		stem: "こさせ",
		ending: "る",
		conjugationOptions: saseruOptions,
	},
	こず: {
		stem: "こず",
	},

	// suru
	suruDefault: textOptions([
		"される",
		"させる",
		"した",
		"します",
		"して",
		"しない",
		"しないで",
		"したい",
		"したり",
		"しよう",
		"する",
		"すれば",
		"せず",
		"できる",
		"し",
	]),
	する: {
		stem: "する",
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
	},
	したり: {
		stem: "したり",
	},
	します: {
		stem: "しま",
		ending: "す",
		conjugationOptions: masuOptions,
	},
	すれば: {
		stem: "すれば",
	},
	して: {
		stem: "して",
		conjugationType: "te",
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
	},
	せず: {
		stem: "せず",
	},
	しないで: {
		stem: "しないで",
		conjugationType: "te",
		conjugationOptions: iadjOptions,
	},

	// suru and ichidan
	させる: {
		stem: "させ",
		ending: "る",
		conjugationOptions: saseruOptions,
	},

	// ichidan
	ichidanDefault: textOptions([
		"ない",
		"ないで",
		"たい",
		"た",
		"る",
		"ろ",
		"たり",
		"て",
		"られる",
		"させる",
		"よう",
		"ます",
		"ず",
		"blank",
	]),
	kureruDefault: textOptions([
		"ない",
		"たい",
		"た",
		"る",
		"たり",
		"て",
		"られる",
		"させる",
		"よう",
		"ます",
		"ず",
		"blank",
	]),
	blank: {
		// stem: "",
		conjugationType: "aux",
	},
	よう: {
		stem: "よう",
	},
	られる: {
		stem: "られ",
		ending: "る",
		conjugationOptions: rareruOptions,
	},
	れば: {
		stem: "れば",
	},
	ろ: {
		stem: "ろ",
	},

	// godan
	る: {
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
	},
	ば: {
		stem: "ば",
	},

	// ichidan and godan
	ない: {
		stem: "な",
		ending: "い",
		conjugationOptions: iadjOptions,
	},
	ないで: {
		stem: "ないで",
		conjugationType: "te",
		conjugationOptions: iadjOptions,
	},
	たい: {
		stem: "た",
		ending: "い",
		conjugationOptions: iadjOptions,
	},
	ず: {
		stem: "ず",
	},
	た: {
		stem: "た",
	},
	たり: {
		stem: "たり",
	},
	て: {
		stem: "て",
		conjugationType: "te",
	},

	// ii
	iiDefault: textOptions(["いい", "よくない", "よかった", "よく", "よくて"]),
	いい: {
		stem: "いい",
	},
	よく: {
		stem: "よく",
	},
	よくて: {
		stem: "よくて",
		conjugationType: "te",
	},
	よくない: {
		stem: "よくな",
		ending: "い",
		conjugationOptions: kunaiOptions,
	},
	よかった: {
		stem: "よかった",
	},

	// i adjectives
	iAdjDefault: iadjOptions,
	い: {
		stem: "い",
	},
	く: {
		stem: "く",
	},
	くて: {
		stem: "くて",
		conjugationType: "te",
	},
	くない: {
		stem: "くな",
		ending: "い",
		conjugationOptions: kunaiOptions,
	},
	かった: {
		stem: "かった",
	},

	// masu
	ます: {
		stem: "ま",
		ending: "す",
		conjugationOptions: masuOptions,
	},
	せん: {
		stem: "せん",
	},
	しょう: {
		stem: "しょう",
	},

	// desu
	desuDefault: textOptions(["だった", "で", "です", "だ"]),
	だ: {
		stem: "だ",
	},
	だった: {
		stem: "だった",
	},
	で: {
		stem: "で",
		conjugationType: "te",
	},
	です: {
		stem: "で",
		ending: "す",
		conjugationOptions: textOptions(["した", "して"]),
	},
}
