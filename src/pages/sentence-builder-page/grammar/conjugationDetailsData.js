export const conjugationDetails = [
	{
		id: "verb-non-past",
		type: "Verb Conjugation",
		grammaticalName: "Non-past",
		englishTranslation: "To do",
		optionTexts: ["る", "くる", "する"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + る",
				examples: ["食べる => 食べる"],
			},
			{
				label: "Godan",
				construction: "B3",
				examples: ["読む => 読む", "書く => 書く"],
			},
			{
				label: "Suru",
				construction: "する",
				examples: ["する => する"],
			},
			{
				label: "Kuru",
				construction: "くる",
				examples: ["くる => くる"],
			},
		],
	},
	{
		id: "verb-negative",
		type: "Verb Conjugation",
		grammaticalName: "Negative",
		englishTranslation: "To not do",
		optionTexts: ["ない", "しない", "こない"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ない",
				examples: ["食べる => 食べない"],
			},
			{
				label: "Godan",
				construction: "B1 + ない",
				examples: ["読む => 読まない", "書く => 書かない"],
			},
			{
				label: "Suru",
				construction: "しない",
				examples: ["する => しない"],
			},
			{
				label: "Kuru",
				construction: "こない",
				examples: ["くる => こない"],
			},
		],
	},
	{
		id: "verb-past",
		type: "Verb Conjugation",
		grammaticalName: "Past",
		englishTranslation: "Did",
		optionTexts: ["た", "した", "きた"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + た",
				examples: ["食べる => 食べた"],
			},
			{
				label: "Godan",
				construction: "Bta",
				examples: ["読む => 読んだ", "書く => 書いた"],
			},
			{
				label: "Suru",
				construction: "した",
				examples: ["する => した"],
			},
			{
				label: "Kuru",
				construction: "きた",
				examples: ["くる => きた"],
			},
		],
	},
	{
		id: "verb-past-negative",
		type: "Verb Conjugation",
		grammaticalName: "Past negative",
		englishTranslation: "Did not do",
		optionTexts: ["なかった", "しなかった", "こなかった"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + なかった",
				examples: ["食べる => 食べなかった"],
			},
			{
				label: "Godan",
				construction: "B1 + なかった",
				examples: ["読む => 読まなかった", "書く => 書かなかった"],
			},
			{
				label: "Suru",
				construction: "しなかった",
				examples: ["する => しなかった"],
			},
			{
				label: "Kuru",
				construction: "こなかった",
				examples: ["くる => こなかった"],
			},
		],
	},
	{
		id: "verb-te-form",
		type: "Verb Conjugation",
		grammaticalName: "Te form",
		englishTranslation: "",
		optionTexts: ["て", "して", "きて"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + て",
				examples: ["食べる => 食べて"],
			},
			{
				label: "Godan",
				construction: "Bte",
				examples: ["読む => 読んで", "書く => 書いて"],
			},
			{
				label: "Suru",
				construction: "して",
				examples: ["する => して"],
			},
			{
				label: "Kuru",
				construction: "きて",
				examples: ["くる => きて"],
			},
		],
	},
	{
		id: "verb-desire",
		type: "Verb Conjugation",
		grammaticalName: "Desire",
		englishTranslation: "Want to do",
		optionTexts: ["たい", "したい", "きたい"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + たい",
				examples: ["食べる => 食べたい"],
			},
			{
				label: "Godan",
				construction: "B2 + たい",
				examples: ["読む => 読みたい", "書く => 書きたい"],
			},
			{
				label: "Suru",
				construction: "したい",
				examples: ["する => したい"],
			},
			{
				label: "Kuru",
				construction: "きたい",
				examples: ["くる => きたい"],
			},
		],
	},
	{
		id: "verb-volitional",
		type: "Verb Conjugation",
		grammaticalName: "Volitional",
		englishTranslation: "Let's do / will do",
		optionTexts: ["よう", "う", "しよう", "こよう"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + よう",
				examples: ["食べる => 食べよう"],
			},
			{
				label: "Godan",
				construction: "B5 + う",
				examples: ["読む => 読もう", "書く => 書こう"],
			},
			{
				label: "Suru",
				construction: "しよう",
				examples: ["する => しよう"],
			},
			{
				label: "Kuru",
				construction: "こよう",
				examples: ["くる => こよう"],
			},
		],
	},
	{
		id: "verb-imperative",
		type: "Verb Conjugation",
		grammaticalName: "Imperative / command",
		englishTranslation: "Do it",
		optionTexts: ["ろ", "れ", "しろ", "こい"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ろ",
				examples: ["食べる => 食べろ"],
			},
			{
				label: "Godan",
				construction: "B4",
				examples: ["読む => 読め", "書く => 書け"],
			},
			{
				label: "Suru",
				construction: "しろ",
				examples: ["する => しろ"],
			},
			{
				label: "Kuru",
				construction: "こい",
				examples: ["くる => こい"],
			},
		],
	},
	{
		id: "verb-negative-imperative",
		type: "Verb Conjugation",
		grammaticalName: "Negative imperative",
		englishTranslation: "Don't do it",
		optionTexts: ["な", "するな", "くるな"],
		constructions: [
			{
				label: "Ichidan",
				construction: "dictionary form + な",
				examples: ["食べる => 食べるな"],
			},
			{
				label: "Godan",
				construction: "dictionary form + な",
				examples: ["読む => 読むな", "書く => 書くな"],
			},
			{
				label: "Suru",
				construction: "するな",
				examples: ["する => するな"],
			},
			{
				label: "Kuru",
				construction: "くるな",
				examples: ["くる => くるな"],
			},
		],
	},
	{
		id: "verb-potential",
		type: "Verb Conjugation",
		grammaticalName: "Potential",
		englishTranslation: "Can do",
		optionTexts: ["られる", "できる", "こられる"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + られる",
				examples: ["食べる => 食べられる"],
			},
			{
				label: "Godan",
				construction: "B4 + る",
				examples: ["読む => 読める", "書く => 書ける"],
			},
			{
				label: "Suru",
				construction: "できる",
				examples: ["する => できる"],
			},
			{
				label: "Kuru",
				construction: "こられる",
				examples: ["くる => こられる"],
			},
		],
	},
	{
		id: "verb-passive",
		type: "Verb Conjugation",
		grammaticalName: "Passive",
		englishTranslation: "To be done / have something done to you",
		optionTexts: ["れる", "される"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + られる",
				examples: ["食べる => 食べられる"],
			},
			{
				label: "Godan",
				construction: "B1 + れる",
				examples: ["読む => 読まれる", "書く => 書かれる"],
			},
			{
				label: "Suru",
				construction: "される",
				examples: ["する => される"],
			},
			{
				label: "Kuru",
				construction: "こられる",
				examples: ["くる => こられる"],
			},
		],
	},
	{
		id: "verb-causative",
		type: "Verb Conjugation",
		grammaticalName: "Causative",
		englishTranslation: "To make / let / have somebody do something",
		optionTexts: ["させる", "せる", "こさせる"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + させる",
				examples: ["食べる => 食べさせる"],
			},
			{
				label: "Godan",
				construction: "B1 + せる",
				examples: ["読む => 読ませる", "書く => 書かせる"],
			},
			{
				label: "Suru",
				construction: "させる",
				examples: ["する => させる"],
			},
			{
				label: "Kuru",
				construction: "こさせる",
				examples: ["くる => こさせる"],
			},
		],
	},
	{
		id: "verb-conditional-ba",
		type: "Verb Conjugation",
		grammaticalName: "Conditional (ba)",
		englishTranslation: "If",
		optionTexts: ["れば", "ば", "すれば", "くれば"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + れば",
				examples: ["食べる => 食べれば"],
			},
			{
				label: "Godan",
				construction: "B4 + ば",
				examples: ["読む => 読めば", "書く => 書けば"],
			},
			{
				label: "Suru",
				construction: "すれば",
				examples: ["する => すれば"],
			},
			{
				label: "Kuru",
				construction: "くれば",
				examples: ["くる => くれば"],
			},
		],
	},
	{
		id: "verb-conditional-tara",
		type: "Verb Conjugation",
		grammaticalName: "Conditional (tara)",
		englishTranslation: "If / when",
		optionTexts: ["たら", "したら", "きたら"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + たら",
				examples: ["食べる => 食べたら"],
			},
			{
				label: "Godan",
				construction: "Bta + ら",
				examples: ["読む => 読んだら", "書く => 書いたら"],
			},
			{
				label: "Suru",
				construction: "したら",
				examples: ["する => したら"],
			},
			{
				label: "Kuru",
				construction: "きたら",
				examples: ["くる => きたら"],
			},
		],
	},
	{
		id: "verb-while-doing",
		type: "Verb Conjugation",
		grammaticalName: "While doing",
		englishTranslation: "While doing",
		optionTexts: ["ながら"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ながら",
				examples: ["食べる => 食べながら"],
			},
			{
				label: "Godan",
				construction: "B2 + ながら",
				examples: ["読む => 読みながら", "書く => 書きながら"],
			},
			{
				label: "Suru",
				construction: "しながら",
				examples: ["する => しながら"],
			},
			{
				label: "Kuru",
				construction: "きながら",
				examples: ["くる => きながら"],
			},
		],
	},
	{
		id: "verb-too-much",
		type: "Verb Conjugation",
		grammaticalName: "Too much",
		englishTranslation: "Do too much",
		optionTexts: ["すぎる"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + すぎる",
				examples: ["食べる => 食べすぎる"],
			},
			{
				label: "Godan",
				construction: "B2 + すぎる",
				examples: ["読む => 読みすぎる", "書く => 書きすぎる"],
			},
			{
				label: "Suru",
				construction: "しすぎる",
				examples: ["する => しすぎる"],
			},
			{
				label: "Kuru",
				construction: "きすぎる",
				examples: ["くる => きすぎる"],
			},
		],
	},
	{
		id: "verb-easy-to-do",
		type: "Verb Conjugation",
		grammaticalName: "Easy to do",
		englishTranslation: "Easy to do",
		optionTexts: ["やすい"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + やすい",
				examples: ["食べる => 食べやすい"],
			},
			{
				label: "Godan",
				construction: "B2 + やすい",
				examples: ["読む => 読みやすい", "書く => 書きやすい"],
			},
			{
				label: "Suru",
				construction: "しやすい",
				examples: ["する => しやすい"],
			},
			{
				label: "Kuru",
				construction: "きやすい",
				examples: ["くる => きやすい"],
			},
		],
	},
	{
		id: "verb-hard-to-do",
		type: "Verb Conjugation",
		grammaticalName: "Hard to do",
		englishTranslation: "Hard to do",
		optionTexts: ["にくい"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + にくい",
				examples: ["食べる => 食べにくい"],
			},
			{
				label: "Godan",
				construction: "B2 + にくい",
				examples: ["読む => 読みにくい", "書く => 書きにくい"],
			},
			{
				label: "Suru",
				construction: "しにくい",
				examples: ["する => しにくい"],
			},
			{
				label: "Kuru",
				construction: "きにくい",
				examples: ["くる => きにくい"],
			},
		],
	},
	{
		id: "verb-way-of-doing",
		type: "Verb Conjugation",
		grammaticalName: "Way of doing",
		englishTranslation: "Way to do",
		optionTexts: ["方"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + 方",
				examples: ["食べる => 食べ方"],
			},
			{
				label: "Godan",
				construction: "B2 + 方",
				examples: ["読む => 読み方", "書く => 書き方"],
			},
			{
				label: "Suru",
				construction: "し方",
				examples: ["する => し方"],
			},
			{
				label: "Kuru",
				construction: "き方",
				examples: ["くる => き方"],
			},
		],
	},
	{
		id: "verb-polite-non-past",
		type: "Verb (polite)",
		grammaticalName: "Non-past",
		englishTranslation: "To do",
		optionTexts: ["ます", "します", "きます"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ます",
				examples: ["食べる => 食べます"],
			},
			{
				label: "Godan",
				construction: "B2 + ます",
				examples: ["読む => 読みます", "書く => 書きます"],
			},
			{
				label: "Suru",
				construction: "します",
				examples: ["する => します"],
			},
			{
				label: "Kuru",
				construction: "きます",
				examples: ["くる => きます"],
			},
		],
	},
	{
		id: "verb-polite-negative",
		type: "Verb (polite)",
		grammaticalName: "Negative",
		englishTranslation: "To not do",
		optionTexts: ["ません", "せん", "しません", "きません"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ません",
				examples: ["食べる => 食べません"],
			},
			{
				label: "Godan",
				construction: "B2 + ません",
				examples: ["読む => 読みません", "書く => 書きません"],
			},
			{
				label: "Suru",
				construction: "しません",
				examples: ["する => しません"],
			},
			{
				label: "Kuru",
				construction: "きません",
				examples: ["くる => きません"],
			},
		],
	},
	{
		id: "verb-polite-te-form",
		type: "Verb (polite)",
		grammaticalName: "Te form",
		englishTranslation: "",
		optionTexts: ["まして"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + まして",
				examples: ["食べる => 食べまして"],
			},
			{
				label: "Godan",
				construction: "B2 + まして",
				examples: ["読む => 読みまして", "書く => 書きまして"],
			},
			{
				label: "Suru",
				construction: "しまして",
				examples: ["する => しまして"],
			},
			{
				label: "Kuru",
				construction: "きまして",
				examples: ["くる => きまして"],
			},
		],
	},
	{
		id: "verb-polite-past",
		type: "Verb (polite)",
		grammaticalName: "Past",
		englishTranslation: "Did",
		optionTexts: ["ました"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ました",
				examples: ["食べる => 食べました"],
			},
			{
				label: "Godan",
				construction: "B2 + ました",
				examples: ["読む => 読みました", "書く => 書きました"],
			},
			{
				label: "Suru",
				construction: "しました",
				examples: ["する => しました"],
			},
			{
				label: "Kuru",
				construction: "きました",
				examples: ["くる => きました"],
			},
		],
	},
	{
		id: "verb-polite-conditional",
		type: "Verb (polite)",
		grammaticalName: "Conditional",
		englishTranslation: "If / when",
		optionTexts: ["ましたら"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ましたら",
				examples: ["食べる => 食べましたら"],
			},
			{
				label: "Godan",
				construction: "B2 + ましたら",
				examples: ["読む => 読みましたら", "書く => 書きましたら"],
			},
			{
				label: "Suru",
				construction: "しましたら",
				examples: ["する => しましたら"],
			},
			{
				label: "Kuru",
				construction: "きましたら",
				examples: ["くる => きましたら"],
			},
		],
	},
	{
		id: "verb-polite-volitional",
		type: "Verb (polite)",
		grammaticalName: "Volitional",
		englishTranslation: "Let's do / will do",
		optionTexts: ["ましょう", "しょう"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + ましょう",
				examples: ["食べる => 食べましょう"],
			},
			{
				label: "Godan",
				construction: "B2 + ましょう",
				examples: ["読む => 読みましょう", "書く => 書きましょう"],
			},
			{
				label: "Suru",
				construction: "しましょう",
				examples: ["する => しましょう"],
			},
			{
				label: "Kuru",
				construction: "きましょう",
				examples: ["くる => きましょう"],
			},
		],
	},
	{
		id: "i-adjective-negative",
		type: "I Adjective Conjugation",
		grammaticalName: "Negative",
		englishTranslation: "Not",
		optionTexts: ["くない", "よくない"],
		constructions: [
			{
				label: "I adjective",
				construction: "stem + くない",
				examples: ["高い => 高くない"],
			},
		],
	},
	{
		id: "i-adjective-conditional-ba",
		type: "I Adjective Conjugation",
		grammaticalName: "Conditional (ba)",
		englishTranslation: "If",
		optionTexts: ["ければ"],
		constructions: [
			{
				label: "I adjective",
				construction: "stem + ければ",
				examples: ["高い => 高ければ"],
			},
		],
	},
	{
		id: "i-adjective-i-form",
		type: "I Adjective Conjugation",
		grammaticalName: "I form",
		englishTranslation: "Is",
		optionTexts: ["い", "いい"],
		constructions: [
			{
				label: "I adjective",
				construction: "stem + い",
				examples: ["高い => 高い"],
			},
		],
	},
	{
		id: "i-adjective-past",
		type: "I Adjective Conjugation",
		grammaticalName: "Past",
		englishTranslation: "Was",
		optionTexts: ["かった", "よかった"],
		constructions: [
			{
				label: "I adjective",
				construction: "stem + かった",
				examples: ["高い => 高かった"],
			},
		],
	},
	{
		id: "i-adjective-te-form",
		type: "I Adjective Conjugation",
		grammaticalName: "Te form",
		englishTranslation: "",
		optionTexts: ["くて", "よくて"],
		constructions: [
			{
				label: "I adjective",
				construction: "stem + くて",
				examples: ["高い => 高くて"],
			},
		],
	},
	{
		id: "i-adjective-adverbial",
		type: "I Adjective Conjugation",
		grammaticalName: "Adverbial",
		englishTranslation: "",
		optionTexts: ["く", "よく"],
		constructions: [
			{
				label: "I adjective",
				construction: "stem + く",
				examples: ["高い => 高く"],
			},
		],
	},
	{
		id: "verb-i-adjective-conjecture",
		type: "Verb and I Adjective Conjugation",
		grammaticalName: "Conjecture",
		englishTranslation: "Seems like",
		optionTexts: ["そう"],
		constructions: [
			{
				label: "Ichidan",
				construction: "stem + そう",
				examples: ["食べる => 食べそう"],
			},
			{
				label: "Godan",
				construction: "B2 + そう",
				examples: ["読む => 読みそう", "書く => 書きそう"],
			},
			{
				label: "Suru",
				construction: "しそう",
				examples: ["する => しそう"],
			},
			{
				label: "Kuru",
				construction: "きそう",
				examples: ["くる => きそう"],
			},
			{
				label: "I adjective",
				construction: "stem + そう",
				examples: ["高い => 高そう"],
			},
		],
	},
	{
		id: "copula-non-past",
		type: "Copula",
		grammaticalName: "Non-past",
		englishTranslation: "Is",
		optionTexts: ["だ"],
		constructions: [
			{
				label: "Copula",
				construction: "だ",
				examples: ["だ"],
			},
		],
	},
	{
		id: "copula-conditional-tara",
		type: "Copula",
		grammaticalName: "Conditional (tara)",
		englishTranslation: "If",
		optionTexts: ["だったら"],
		constructions: [
			{
				label: "Copula",
				construction: "だった + ら",
				examples: ["だったら"],
			},
		],
	},
	{
		id: "copula-past",
		type: "Copula",
		grammaticalName: "Past",
		englishTranslation: "Was",
		optionTexts: ["だった"],
		constructions: [
			{
				label: "Copula",
				construction: "だった",
				examples: ["だった"],
			},
		],
	},
	{
		id: "copula-te-form",
		type: "Copula",
		grammaticalName: "Te form",
		englishTranslation: "",
		optionTexts: ["で"],
		constructions: [
			{
				label: "Copula",
				construction: "で",
				examples: ["で"],
			},
		],
	},
	{
		id: "copula-polite-non-past",
		type: "Copula (polite)",
		grammaticalName: "Non-past",
		englishTranslation: "Is",
		optionTexts: ["です"],
		constructions: [
			{
				label: "Copula",
				construction: "です",
				examples: ["です"],
			},
		],
	},
	{
		id: "copula-polite-conditional-tara",
		type: "Copula (polite)",
		grammaticalName: "Conditional (tara)",
		englishTranslation: "If",
		optionTexts: ["でしたら"],
		constructions: [
			{
				label: "Copula",
				construction: "でした + ら",
				examples: ["でしたら"],
			},
		],
	},
	{
		id: "copula-polite-past",
		type: "Copula (polite)",
		grammaticalName: "Past",
		englishTranslation: "Was",
		optionTexts: ["でした"],
		constructions: [
			{
				label: "Copula",
				construction: "でした",
				examples: ["でした"],
			},
		],
	},
	{
		id: "copula-polite-te-form",
		type: "Copula (polite)",
		grammaticalName: "Te form",
		englishTranslation: "",
		optionTexts: ["でして"],
		constructions: [
			{
				label: "Copula",
				construction: "でして",
				examples: ["でして"],
			},
		],
	},
]

const conjugationDetailsById = new Map(
	conjugationDetails.map((detail) => [detail.id, detail]),
)

const conjugationDetailIdsByText = new Map()
conjugationDetails.forEach((detail) => {
	detail.optionTexts.forEach((text) => {
		if (!conjugationDetailIdsByText.has(text)) {
			conjugationDetailIdsByText.set(text, detail.id)
		}
	})
})

export function getConjugationDetail(element) {
	if (!element) return null
	if (element.detailId) return conjugationDetailsById.get(element.detailId) || null
	if (element.elementType && element.elementType !== "desu") return null
	if (element.list && element.text !== "だ") return null

	const detailId = conjugationDetailIdsByText.get(element.text)
	return detailId ? conjugationDetailsById.get(detailId) || null : null
}
