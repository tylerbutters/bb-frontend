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

const iAdjectiveOptions = [
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

const desuPoliteOptions = [
	{ text: "した", detailId: "copula-polite-past" },
	{ text: "して", detailId: "copula-polite-te-form" },
]

// Forms reference these keys so the selected-form table stays compact and readable.
export const followUpOptionsByKey = {
	rareru: rareruOptions,
	saseru: saseruOptions,
	masu: masuOptions,
	iAdjective: iAdjectiveOptions,
	kunai: kunaiOptions,
	desuPolite: desuPoliteOptions,
}

export const godanRows = {
	く: { b1: "か", b2: "き", b3: "く", b4: "け", b5: "こ", te: "いて", past: "いた" },
	ぐ: { b1: "が", b2: "ぎ", b3: "ぐ", b4: "げ", b5: "ご", te: "いで", past: "いだ" },
	す: { b1: "さ", b2: "し", b3: "す", b4: "せ", b5: "そ", te: "して", past: "した" },
	ぶ: { b1: "ば", b2: "び", b3: "ぶ", b4: "べ", b5: "ぼ", te: "んで", past: "んだ" },
	む: { b1: "ま", b2: "み", b3: "む", b4: "め", b5: "も", te: "んで", past: "んだ" },
	ぬ: { b1: "な", b2: "に", b3: "ぬ", b4: "ね", b5: "の", te: "んで", past: "んだ" },
	る: { b1: "ら", b2: "り", b3: "る", b4: "れ", b5: "ろ", te: "って", past: "った" },
	つ: { b1: "た", b2: "ち", b3: "つ", b4: "て", b5: "と", te: "って", past: "った" },
	う: { b1: "わ", b2: "い", b3: "う", b4: "え", b5: "お", te: "って", past: "った" },
}

export const godanDefaults = {
	b1: [
		{ text: "ない", detailId: "verb-negative" },
		{ text: "れる", detailId: "verb-passive" },
		{ text: "せる", detailId: "verb-causative" },
		{ text: "ず", detailId: "verb-zu-negative" },
	],
	b2: [
		{ text: "ます", detailId: "verb-polite-non-past" },
		{ text: "たい", detailId: "verb-desire" },
	],
	b4: [
		{ text: "ば", detailId: "verb-conditional-ba" },
		{ text: "る", detailId: "verb-potential" },
		{ text: "れ", detailId: "verb-imperative" },
	],
	b5: [{ text: "う", detailId: "verb-volitional" }],
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

// Base options are what the menu shows before a parent element has any conjugation.
export const baseOptionsByParentType = {
	kuru: [
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
	suru: [
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
	ichidan: [
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
	kureru: [
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
	iiAdjective: [
		{ text: "いい", detailId: "i-adjective-i-form" },
		{ text: "よくない", detailId: "i-adjective-negative" },
		{ text: "よかった", detailId: "i-adjective-past" },
		{ text: "よく", detailId: "i-adjective-adverbial" },
		{ text: "よくて", detailId: "i-adjective-te-form" },
	],
	iAdjective: iAdjectiveOptions,
	desu: [
		{ text: "だった", detailId: "copula-past" },
		{ text: "で", detailId: "copula-te-form" },
		{ text: "です", detailId: "copula-polite-non-past" },
		{ text: "だ", detailId: "copula-non-past" },
	],
}

// Forms are what a selected menu option becomes in the sentence-builder state.
export const conjugationFormByText = {
	// kuru
	き: { stem: "き", conjugationType: "aux" },
	くる: { stem: "くる" },
	こない: { stem: "こな", ending: "い", followUpOptionsKey: "iAdjective" },
	きた: { stem: "きた" },
	きたり: { stem: "きたり" },
	こないで: { stem: "こないで", conjugationType: "te", followUpOptionsKey: "iAdjective" },
	きて: { stem: "きて", conjugationType: "te" },
	きたい: { stem: "きた", ending: "い", followUpOptionsKey: "iAdjective" },
	こられる: { stem: "こられ", ending: "る", followUpOptionsKey: "rareru" },
	こよう: { stem: "こよう" },
	きます: { stem: "きま", ending: "す", followUpOptionsKey: "masu" },
	くれば: { stem: "くれば" },
	こさせる: { stem: "こさせ", ending: "る", followUpOptionsKey: "saseru" },
	こず: { stem: "こず" },

	// suru
	する: { stem: "する" },
	し: { stem: "し", conjugationType: "aux" },
	される: { stem: "され", ending: "る", followUpOptionsKey: "saseru" },
	しない: { stem: "しな", ending: "い", followUpOptionsKey: "iAdjective" },
	した: { stem: "した" },
	したり: { stem: "したり" },
	します: { stem: "しま", ending: "す", followUpOptionsKey: "masu" },
	すれば: { stem: "すれば" },
	して: { stem: "して", conjugationType: "te" },
	したい: { stem: "した", ending: "い", followUpOptionsKey: "iAdjective" },
	できる: { stem: "でき", ending: "る", followUpOptionsKey: "rareru" },
	しよう: { stem: "しよう" },
	せず: { stem: "せず" },
	しないで: { stem: "しないで", conjugationType: "te", followUpOptionsKey: "iAdjective" },

	// suru and ichidan
	させる: { stem: "させ", ending: "る", followUpOptionsKey: "saseru" },

	// ichidan
	blank: { conjugationType: "aux" },
	よう: { stem: "よう" },
	られる: { stem: "られ", ending: "る", followUpOptionsKey: "rareru" },
	れば: { stem: "れば" },
	ろ: { stem: "ろ" },

	// godan
	る: { ending: "る", followUpOptionsKey: "rareru" },
	れる: { stem: "れ", ending: "る", followUpOptionsKey: "rareru" },
	せる: { stem: "せ", ending: "る", followUpOptionsKey: "saseru" },
	う: { stem: "う" },
	ば: { stem: "ば" },

	// ichidan and godan
	ない: { stem: "な", ending: "い", followUpOptionsKey: "iAdjective" },
	ないで: { stem: "ないで", conjugationType: "te", followUpOptionsKey: "iAdjective" },
	たい: { stem: "た", ending: "い", followUpOptionsKey: "iAdjective" },
	ず: { stem: "ず" },
	た: { stem: "た" },
	たり: { stem: "たり" },
	て: { stem: "て", conjugationType: "te" },

	// ii
	いい: { stem: "いい" },
	よく: { stem: "よく" },
	よくて: { stem: "よくて", conjugationType: "te" },
	よくない: { stem: "よくな", ending: "い", followUpOptionsKey: "kunai" },
	よかった: { stem: "よかった" },

	// i adjectives
	い: { stem: "い" },
	く: { stem: "く" },
	くて: { stem: "くて", conjugationType: "te" },
	くない: { stem: "くな", ending: "い", followUpOptionsKey: "kunai" },
	かった: { stem: "かった" },

	// masu
	ます: { stem: "ま", ending: "す", followUpOptionsKey: "masu" },
	せん: { stem: "せん" },
	しょう: { stem: "しょう" },

	// desu
	だ: { stem: "だ" },
	だった: { stem: "だった" },
	で: { stem: "で", conjugationType: "te" },
	です: { stem: "で", ending: "す", followUpOptionsKey: "desuPolite" },
}
