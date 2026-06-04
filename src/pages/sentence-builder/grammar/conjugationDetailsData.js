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
				examples: [
					{ base: "食べる", conjugation: "食べる" },
				],
			},
			{
				label: "Godan",
				construction: "B3",
				examples: [
					{ base: "読む", conjugation: "読む" },
					{ base: "書く", conjugation: "書く" },
				],
			},
			{
				label: "Suru",
				construction: "する",
				examples: [
					{ base: "する", conjugation: "する" },
				],
			},
			{
				label: "Kuru",
				construction: "くる",
				examples: [
					{ base: "くる", conjugation: "くる" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べない" },
				],
			},
			{
				label: "Godan",
				construction: "B1 + ない",
				examples: [
					{ base: "読む", conjugation: "読まない" },
					{ base: "書く", conjugation: "書かない" },
				],
			},
			{
				label: "Suru",
				construction: "しない",
				examples: [
					{ base: "する", conjugation: "しない" },
				],
			},
			{
				label: "Kuru",
				construction: "こない",
				examples: [
					{ base: "くる", conjugation: "こない" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べた" },
				],
			},
			{
				label: "Godan",
				construction: "Bta",
				examples: [
					{ base: "読む", conjugation: "読んだ" },
					{ base: "書く", conjugation: "書いた" },
				],
			},
			{
				label: "Suru",
				construction: "した",
				examples: [
					{ base: "する", conjugation: "した" },
				],
			},
			{
				label: "Kuru",
				construction: "きた",
				examples: [
					{ base: "くる", conjugation: "きた" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べなかった" },
				],
			},
			{
				label: "Godan",
				construction: "B1 + なかった",
				examples: [
					{ base: "読む", conjugation: "読まなかった" },
					{ base: "書く", conjugation: "書かなかった" },
				],
			},
			{
				label: "Suru",
				construction: "しなかった",
				examples: [
					{ base: "する", conjugation: "しなかった" },
				],
			},
			{
				label: "Kuru",
				construction: "こなかった",
				examples: [
					{ base: "くる", conjugation: "こなかった" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べて" },
				],
			},
			{
				label: "Godan",
				construction: "Bte",
				examples: [
					{ base: "読む", conjugation: "読んで" },
					{ base: "書く", conjugation: "書いて" },
				],
			},
			{
				label: "Suru",
				construction: "して",
				examples: [
					{ base: "する", conjugation: "して" },
				],
			},
			{
				label: "Kuru",
				construction: "きて",
				examples: [
					{ base: "くる", conjugation: "きて" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べたい" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + たい",
				examples: [
					{ base: "読む", conjugation: "読みたい" },
					{ base: "書く", conjugation: "書きたい" },
				],
			},
			{
				label: "Suru",
				construction: "したい",
				examples: [
					{ base: "する", conjugation: "したい" },
				],
			},
			{
				label: "Kuru",
				construction: "きたい",
				examples: [
					{ base: "くる", conjugation: "きたい" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べよう" },
				],
			},
			{
				label: "Godan",
				construction: "B5 + う",
				examples: [
					{ base: "読む", conjugation: "読もう" },
					{ base: "書く", conjugation: "書こう" },
				],
			},
			{
				label: "Suru",
				construction: "しよう",
				examples: [
					{ base: "する", conjugation: "しよう" },
				],
			},
			{
				label: "Kuru",
				construction: "こよう",
				examples: [
					{ base: "くる", conjugation: "こよう" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べろ" },
				],
			},
			{
				label: "Godan",
				construction: "B4",
				examples: [
					{ base: "読む", conjugation: "読め" },
					{ base: "書く", conjugation: "書け" },
				],
			},
			{
				label: "Suru",
				construction: "しろ",
				examples: [
					{ base: "する", conjugation: "しろ" },
				],
			},
			{
				label: "Kuru",
				construction: "こい",
				examples: [
					{ base: "くる", conjugation: "こい" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べるな" },
				],
			},
			{
				label: "Godan",
				construction: "dictionary form + な",
				examples: [
					{ base: "読む", conjugation: "読むな" },
					{ base: "書く", conjugation: "書くな" },
				],
			},
			{
				label: "Suru",
				construction: "するな",
				examples: [
					{ base: "する", conjugation: "するな" },
				],
			},
			{
				label: "Kuru",
				construction: "くるな",
				examples: [
					{ base: "くる", conjugation: "くるな" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べられる" },
				],
			},
			{
				label: "Godan",
				construction: "B4 + る",
				examples: [
					{ base: "読む", conjugation: "読める" },
					{ base: "書く", conjugation: "書ける" },
				],
			},
			{
				label: "Suru",
				construction: "できる",
				examples: [
					{ base: "する", conjugation: "できる" },
				],
			},
			{
				label: "Kuru",
				construction: "こられる",
				examples: [
					{ base: "くる", conjugation: "こられる" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べられる" },
				],
			},
			{
				label: "Godan",
				construction: "B1 + れる",
				examples: [
					{ base: "読む", conjugation: "読まれる" },
					{ base: "書く", conjugation: "書かれる" },
				],
			},
			{
				label: "Suru",
				construction: "される",
				examples: [
					{ base: "する", conjugation: "される" },
				],
			},
			{
				label: "Kuru",
				construction: "こられる",
				examples: [
					{ base: "くる", conjugation: "こられる" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べさせる" },
				],
			},
			{
				label: "Godan",
				construction: "B1 + せる",
				examples: [
					{ base: "読む", conjugation: "読ませる" },
					{ base: "書く", conjugation: "書かせる" },
				],
			},
			{
				label: "Suru",
				construction: "させる",
				examples: [
					{ base: "する", conjugation: "させる" },
				],
			},
			{
				label: "Kuru",
				construction: "こさせる",
				examples: [
					{ base: "くる", conjugation: "こさせる" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べれば" },
				],
			},
			{
				label: "Godan",
				construction: "B4 + ば",
				examples: [
					{ base: "読む", conjugation: "読めば" },
					{ base: "書く", conjugation: "書けば" },
				],
			},
			{
				label: "Suru",
				construction: "すれば",
				examples: [
					{ base: "する", conjugation: "すれば" },
				],
			},
			{
				label: "Kuru",
				construction: "くれば",
				examples: [
					{ base: "くる", conjugation: "くれば" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べたら" },
				],
			},
			{
				label: "Godan",
				construction: "Bta + ら",
				examples: [
					{ base: "読む", conjugation: "読んだら" },
					{ base: "書く", conjugation: "書いたら" },
				],
			},
			{
				label: "Suru",
				construction: "したら",
				examples: [
					{ base: "する", conjugation: "したら" },
				],
			},
			{
				label: "Kuru",
				construction: "きたら",
				examples: [
					{ base: "くる", conjugation: "きたら" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べながら" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + ながら",
				examples: [
					{ base: "読む", conjugation: "読みながら" },
					{ base: "書く", conjugation: "書きながら" },
				],
			},
			{
				label: "Suru",
				construction: "しながら",
				examples: [
					{ base: "する", conjugation: "しながら" },
				],
			},
			{
				label: "Kuru",
				construction: "きながら",
				examples: [
					{ base: "くる", conjugation: "きながら" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べすぎる" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + すぎる",
				examples: [
					{ base: "読む", conjugation: "読みすぎる" },
					{ base: "書く", conjugation: "書きすぎる" },
				],
			},
			{
				label: "Suru",
				construction: "しすぎる",
				examples: [
					{ base: "する", conjugation: "しすぎる" },
				],
			},
			{
				label: "Kuru",
				construction: "きすぎる",
				examples: [
					{ base: "くる", conjugation: "きすぎる" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べやすい" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + やすい",
				examples: [
					{ base: "読む", conjugation: "読みやすい" },
					{ base: "書く", conjugation: "書きやすい" },
				],
			},
			{
				label: "Suru",
				construction: "しやすい",
				examples: [
					{ base: "する", conjugation: "しやすい" },
				],
			},
			{
				label: "Kuru",
				construction: "きやすい",
				examples: [
					{ base: "くる", conjugation: "きやすい" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べにくい" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + にくい",
				examples: [
					{ base: "読む", conjugation: "読みにくい" },
					{ base: "書く", conjugation: "書きにくい" },
				],
			},
			{
				label: "Suru",
				construction: "しにくい",
				examples: [
					{ base: "する", conjugation: "しにくい" },
				],
			},
			{
				label: "Kuru",
				construction: "きにくい",
				examples: [
					{ base: "くる", conjugation: "きにくい" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べ方" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + 方",
				examples: [
					{ base: "読む", conjugation: "読み方" },
					{ base: "書く", conjugation: "書き方" },
				],
			},
			{
				label: "Suru",
				construction: "し方",
				examples: [
					{ base: "する", conjugation: "し方" },
				],
			},
			{
				label: "Kuru",
				construction: "き方",
				examples: [
					{ base: "くる", conjugation: "き方" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べます" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + ます",
				examples: [
					{ base: "読む", conjugation: "読みます" },
					{ base: "書く", conjugation: "書きます" },
				],
			},
			{
				label: "Suru",
				construction: "します",
				examples: [
					{ base: "する", conjugation: "します" },
				],
			},
			{
				label: "Kuru",
				construction: "きます",
				examples: [
					{ base: "くる", conjugation: "きます" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べません" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + ません",
				examples: [
					{ base: "読む", conjugation: "読みません" },
					{ base: "書く", conjugation: "書きません" },
				],
			},
			{
				label: "Suru",
				construction: "しません",
				examples: [
					{ base: "する", conjugation: "しません" },
				],
			},
			{
				label: "Kuru",
				construction: "きません",
				examples: [
					{ base: "くる", conjugation: "きません" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べまして" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + まして",
				examples: [
					{ base: "読む", conjugation: "読みまして" },
					{ base: "書く", conjugation: "書きまして" },
				],
			},
			{
				label: "Suru",
				construction: "しまして",
				examples: [
					{ base: "する", conjugation: "しまして" },
				],
			},
			{
				label: "Kuru",
				construction: "きまして",
				examples: [
					{ base: "くる", conjugation: "きまして" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べました" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + ました",
				examples: [
					{ base: "読む", conjugation: "読みました" },
					{ base: "書く", conjugation: "書きました" },
				],
			},
			{
				label: "Suru",
				construction: "しました",
				examples: [
					{ base: "する", conjugation: "しました" },
				],
			},
			{
				label: "Kuru",
				construction: "きました",
				examples: [
					{ base: "くる", conjugation: "きました" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べましたら" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + ましたら",
				examples: [
					{ base: "読む", conjugation: "読みましたら" },
					{ base: "書く", conjugation: "書きましたら" },
				],
			},
			{
				label: "Suru",
				construction: "しましたら",
				examples: [
					{ base: "する", conjugation: "しましたら" },
				],
			},
			{
				label: "Kuru",
				construction: "きましたら",
				examples: [
					{ base: "くる", conjugation: "きましたら" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べましょう" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + ましょう",
				examples: [
					{ base: "読む", conjugation: "読みましょう" },
					{ base: "書く", conjugation: "書きましょう" },
				],
			},
			{
				label: "Suru",
				construction: "しましょう",
				examples: [
					{ base: "する", conjugation: "しましょう" },
				],
			},
			{
				label: "Kuru",
				construction: "きましょう",
				examples: [
					{ base: "くる", conjugation: "きましょう" },
				],
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
				examples: [
					{ base: "高い", conjugation: "高くない" },
				],
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
				examples: [
					{ base: "高い", conjugation: "高ければ" },
				],
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
				examples: [
					{ base: "高い", conjugation: "高い" },
				],
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
				examples: [
					{ base: "高い", conjugation: "高かった" },
				],
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
				examples: [
					{ base: "高い", conjugation: "高くて" },
				],
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
				examples: [
					{ base: "高い", conjugation: "高く" },
				],
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
				examples: [
					{ base: "食べる", conjugation: "食べそう" },
				],
			},
			{
				label: "Godan",
				construction: "B2 + そう",
				examples: [
					{ base: "読む", conjugation: "読みそう" },
					{ base: "書く", conjugation: "書きそう" },
				],
			},
			{
				label: "Suru",
				construction: "しそう",
				examples: [
					{ base: "する", conjugation: "しそう" },
				],
			},
			{
				label: "Kuru",
				construction: "きそう",
				examples: [
					{ base: "くる", conjugation: "きそう" },
				],
			},
			{
				label: "I adjective",
				construction: "stem + そう",
				examples: [
					{ base: "高い", conjugation: "高そう" },
				],
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
				examples: [
					{ conjugation: "だ" },
				],
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
				examples: [
					{ conjugation: "だったら" },
				],
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
				examples: [
					{ conjugation: "だった" },
				],
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
				examples: [
					{ conjugation: "で" },
				],
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
				examples: [
					{ conjugation: "です" },
				],
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
				examples: [
					{ conjugation: "でしたら" },
				],
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
				examples: [
					{ conjugation: "でした" },
				],
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
				examples: [
					{ conjugation: "でして" },
				],
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
