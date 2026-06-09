import verbs from "../jmdict/processed/verbs.json"
import adjectives from "../jmdict/processed/adjectives.json"

const rareruOptions = [
	{ text: "る", detailId: "verb-non-past" },
	{ text: "ない", detailId: "verb-negative" },
	{ text: "ないで", detailId: "verb-negative-te-form" },
	{ text: "たい", detailId: "verb-desire" },
	{ text: "た", detailId: "verb-past" },
	{ text: "たり", detailId: "verb-tari-form" },
	{ text: "て", detailId: "verb-te-form" },
	{ text: "よう", detailId: "verb-volitional" },
	{ text: "ます", detailId: "verb-polite-non-past" },
	{ text: "ず", detailId: "verb-zu-negative" },
]

const saseruOptions = [
	{ text: "る", detailId: "verb-non-past" },
	{ text: "ない", detailId: "verb-negative" },
	{ text: "ないで", detailId: "verb-negative-te-form" },
	{ text: "たい", detailId: "verb-desire" },
	{ text: "ます", detailId: "verb-polite-non-past" },
	{ text: "た", detailId: "verb-past" },
	{ text: "たり", detailId: "verb-tari-form" },
	{ text: "て", detailId: "verb-te-form" },
	{ text: "よう", detailId: "verb-volitional" },
	{ text: "られる", detailId: "verb-passive" },
	{ text: "ず", detailId: "verb-zu-negative" },
]

const masuOptions = [
	{ text: "ます", detailId: "verb-polite-non-past" },
	{ text: "せん", detailId: "verb-polite-negative" },
	{ text: "した", detailId: "verb-polite-past" },
	{ text: "して", detailId: "verb-polite-te-form" },
	{ text: "しょう", detailId: "verb-polite-volitional" },
]

const iadjOptions = [
	{ text: "い", detailId: "i-adjective-i-form" },
	{ text: "くない", detailId: "i-adjective-negative" },
	{ text: "かった", detailId: "i-adjective-past" },
	{ text: "く", detailId: "i-adjective-adverbial" },
	{ text: "くて", detailId: "i-adjective-te-form" },
]

const kunaiOptions = [
	{ text: "い", detailId: "i-adjective-i-form" },
	{ text: "かった", detailId: "i-adjective-past" },
	{ text: "く", detailId: "i-adjective-adverbial" },
	{ text: "くて", detailId: "i-adjective-te-form" },
]

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
	B1: [
		{ text: "ない", detailId: "verb-negative" },
		{ text: "れる", detailId: "verb-passive" },
		{ text: "せる", detailId: "verb-causative" },
		{ text: "ず", detailId: "verb-zu-negative" },
	],
	B2: [
		{ text: "ます", detailId: "verb-polite-non-past" },
		{ text: "たい", detailId: "verb-desire" },
	],
	B4: [
		{ text: "ば", detailId: "verb-conditional-ba" },
		{ text: "る", detailId: "verb-potential" },
		{ text: "れ", detailId: "verb-imperative" },
	],
	B5: [{ text: "う", detailId: "verb-volitional" }],
}

export const auxiliaryDefinitions = [
	{ text: "始める", elementType: "verb" },
	{ text: "終わる", elementType: "verb" },
	{ text: "続ける", elementType: "verb" },
	{ text: "すぎる", elementType: "verb", detailId: "verb-too-much" },
	{ text: "直す", elementType: "verb" },
	{ text: "切る", elementType: "verb" },
	{ text: "出す", elementType: "verb" },
	{ text: "合う", elementType: "verb" },
	{ text: "慣れる", elementType: "verb" },
	{ text: "忘れる", elementType: "verb" },
	{ text: "残す", elementType: "verb" },
	{ text: "疲れる", elementType: "verb" },
	{ text: "比べる", elementType: "verb" },
	{ text: "やすい", elementType: "adjective", detailId: "verb-easy-to-do" },
	{ text: "にくい", elementType: "adjective", detailId: "verb-hard-to-do" },
]

function formatAuxiliaryDefinitions() {
	return auxiliaryDefinitions
		.map((aux) => {
			if (aux.elementType === "verb") {
				const verb = verbs.find((verb) => verb.text === aux.text || verb.textKana === aux.text)
				return verb ? { ...verb, detailId: aux.detailId } : null
			} else if (aux.elementType === "adjective") {
				const adjective = adjectives.find(
					(adj) => adj.text === aux.text || adj.textKana === aux.text,
				)
				return adjective ? { ...adjective, detailId: aux.detailId } : null
			}
			return null
		})
		.filter(Boolean)
}

export const auxiliaries = formatAuxiliaryDefinitions()

export const noDesu = [{ text: "の" }, { text: "なの" }, { text: "ん" }, { text: "なん" }]

export const conjugations = {
	// kuru
	kuruDefault: [
		{ text: "きて", detailId: "verb-te-form" },
		{ text: "きた", detailId: "verb-past" },
		{ text: "きたり", detailId: "verb-tari-form" },
		{ text: "きます", detailId: "verb-polite-non-past" },
		{ text: "きたい", detailId: "verb-desire" },
		{ text: "きたら", detailId: "verb-conditional-tara" },
		{ text: "くれば", detailId: "verb-conditional-ba" },
		{ text: "くる", detailId: "verb-non-past" },
		{ text: "こない", detailId: "verb-negative" },
		{ text: "こないで", detailId: "verb-negative-te-form" },
		{ text: "こられる", detailId: "verb-potential" },
		{ text: "こい", detailId: "verb-imperative" },
		{ text: "こよう", detailId: "verb-volitional" },
		{ text: "こさせる", detailId: "verb-causative" },
		{ text: "こず", detailId: "verb-zu-negative" },
		{ text: "き", detailId: "verb-stem" },
	],
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
	suruDefault: [
		{ text: "される", detailId: "verb-passive" },
		{ text: "させる", detailId: "verb-causative" },
		{ text: "した", detailId: "verb-past" },
		{ text: "します", detailId: "verb-polite-non-past" },
		{ text: "して", detailId: "verb-te-form" },
		{ text: "しない", detailId: "verb-negative" },
		{ text: "しないで", detailId: "verb-negative-te-form" },
		{ text: "したい", detailId: "verb-desire" },
		{ text: "したり", detailId: "verb-tari-form" },
		{ text: "しよう", detailId: "verb-volitional" },
		{ text: "する", detailId: "verb-non-past" },
		{ text: "すれば", detailId: "verb-conditional-ba" },
		{ text: "せず", detailId: "verb-zu-negative" },
		{ text: "できる", detailId: "verb-potential" },
		{ text: "し", detailId: "verb-stem" },
	],
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
	ichidanDefault: [
		{ text: "ない", detailId: "verb-negative" },
		{ text: "ないで", detailId: "verb-negative-te-form" },
		{ text: "たい", detailId: "verb-desire" },
		{ text: "た", detailId: "verb-past" },
		{ text: "る", detailId: "verb-non-past" },
		{ text: "ろ", detailId: "verb-imperative" },
		{ text: "たり", detailId: "verb-tari-form" },
		{ text: "て", detailId: "verb-te-form" },
		{ text: "られる", detailId: "verb-potential" },
		{ text: "させる", detailId: "verb-causative" },
		{ text: "よう", detailId: "verb-volitional" },
		{ text: "ます", detailId: "verb-polite-non-past" },
		{ text: "ず", detailId: "verb-zu-negative" },
		{ text: "blank", detailId: "verb-stem" },
	],
	kureruDefault: [
		{ text: "ない", detailId: "verb-negative" },
		{ text: "たい", detailId: "verb-desire" },
		{ text: "た", detailId: "verb-past" },
		{ text: "る", detailId: "verb-non-past" },
		{ text: "たり", detailId: "verb-tari-form" },
		{ text: "て", detailId: "verb-te-form" },
		{ text: "られる", detailId: "verb-potential" },
		{ text: "させる", detailId: "verb-causative" },
		{ text: "よう", detailId: "verb-volitional" },
		{ text: "ます", detailId: "verb-polite-non-past" },
		{ text: "ず", detailId: "verb-zu-negative" },
		{ text: "blank", detailId: "verb-stem" },
	],
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
	iiDefault: [
		{ text: "いい", detailId: "i-adjective-i-form" },
		{ text: "よくない", detailId: "i-adjective-negative" },
		{ text: "よかった", detailId: "i-adjective-past" },
		{ text: "よく", detailId: "i-adjective-adverbial" },
		{ text: "よくて", detailId: "i-adjective-te-form" },
	],
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
	desuDefault: [
		{ text: "だった", detailId: "copula-past" },
		{ text: "で", detailId: "copula-te-form" },
		{ text: "です", detailId: "copula-polite-non-past" },
		{ text: "だ", detailId: "copula-non-past" },
	],
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
		conjugationOptions: [
			{ text: "した", detailId: "copula-polite-past" },
			{ text: "して", detailId: "copula-polite-te-form" },
		],
	},
}
