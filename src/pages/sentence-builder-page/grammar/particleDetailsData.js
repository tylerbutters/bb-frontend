export const particleDetails = [
	{
		text: "から",
		type: "Particle",
		englishTranslation: "from / since / because",
		uses: [
			{
				label: "Starting point",
				meaning: "Marks where something starts from.",
				examples: ["学校から帰る => return from school"],
			},
			{
				label: "Reason",
				meaning: "Marks a reason or cause.",
				examples: ["暑いから行かない => I won't go because it is hot"],
			},
		],
	},
	{
		text: "は",
		type: "Particle",
		englishTranslation: "topic / contrast",
		uses: [
			{
				label: "Topic",
				meaning: "Marks what the sentence is about.",
				examples: ["私は学生です => I am a student"],
			},
			{
				label: "Contrast",
				meaning: "Highlights contrast with another possible topic.",
				examples: ["水は飲む => I drink water, at least"],
			},
		],
	},
	{
		text: "も",
		type: "Particle",
		englishTranslation: "also / too / even",
		uses: [
			{
				label: "Also",
				meaning: "Adds something to a previous item or idea.",
				examples: ["私も行く => I will go too"],
			},
			{
				label: "Even",
				meaning: "Emphasizes an unexpected item.",
				examples: ["子供も分かる => even children understand"],
			},
		],
	},
	{
		text: "が",
		type: "Particle",
		englishTranslation: "subject / but",
		uses: [
			{
				label: "Subject",
				meaning: "Marks the subject, often new or focused information.",
				examples: ["猫がいる => there is a cat"],
			},
			{
				label: "Contrast",
				meaning: "Can connect clauses with a soft but.",
				examples: ["高いが便利だ => it is expensive, but useful"],
			},
		],
	},
	{
		text: "を",
		type: "Particle",
		englishTranslation: "direct object",
		uses: [
			{
				label: "Object",
				meaning: "Marks the thing directly acted on.",
				examples: ["本を読む => read a book"],
			},
			{
				label: "Route",
				meaning: "Marks a place moved through or left.",
				examples: ["道を歩く => walk along the road"],
			},
		],
	},
	{
		text: "に",
		type: "Particle",
		englishTranslation: "target / time / location",
		uses: [
			{
				label: "Target",
				meaning: "Marks a destination, recipient, or target.",
				examples: ["学校に行く => go to school"],
			},
			{
				label: "Time",
				meaning: "Marks a specific time.",
				examples: ["七時に起きる => wake up at seven"],
			},
		],
	},
	{
		text: "へ",
		type: "Particle",
		englishTranslation: "toward / to",
		uses: [
			{
				label: "Direction",
				meaning: "Marks direction or destination.",
				examples: ["日本へ行く => go to Japan"],
			},
		],
	},
	{
		text: "で",
		type: "Particle",
		englishTranslation: "at / by means of / with",
		uses: [
			{
				label: "Place of action",
				meaning: "Marks where an action happens.",
				examples: ["学校で勉強する => study at school"],
			},
			{
				label: "Means",
				meaning: "Marks the tool, method, or material used.",
				examples: ["電車で行く => go by train"],
			},
		],
	},
	{
		text: "と",
		type: "Particle",
		englishTranslation: "and / with / quote",
		uses: [
			{
				label: "And",
				meaning: "Connects nouns in an exhaustive list.",
				examples: ["猫と犬 => cats and dogs"],
			},
			{
				label: "Quote",
				meaning: "Marks quoted speech or thought.",
				examples: ["行くと言う => say that one will go"],
			},
		],
	},
	{
		text: "こそ",
		type: "Particle",
		englishTranslation: "emphasis / precisely",
		uses: [
			{
				label: "Emphasis",
				meaning: "Strongly emphasizes the marked word.",
				examples: ["今日こそ行く => today, for sure, I will go"],
			},
		],
	},
	{
		text: "さえ",
		type: "Particle",
		englishTranslation: "even",
		uses: [
			{
				label: "Even",
				meaning: "Marks an extreme or surprising example.",
				examples: ["子供さえ分かる => even children understand"],
			},
		],
	},
	{
		text: "しか",
		type: "Particle",
		englishTranslation: "only / nothing but",
		uses: [
			{
				label: "Only",
				meaning: "Used with a negative predicate to mean only.",
				examples: ["水しか飲まない => drink only water"],
			},
		],
	},
	{
		text: "ばかり",
		type: "Particle",
		englishTranslation: "only / just / about",
		uses: [
			{
				label: "Only",
				meaning: "Marks something as the only or repeated thing.",
				examples: ["本ばかり読む => read only books"],
			},
			{
				label: "Approximate",
				meaning: "Marks an approximate amount.",
				examples: ["三時間ばかり => about three hours"],
			},
		],
	},
	{
		text: "だけ",
		type: "Particle",
		englishTranslation: "only / just",
		uses: [
			{
				label: "Limit",
				meaning: "Marks a limited amount or scope.",
				examples: ["水だけ飲む => drink only water"],
			},
		],
	},
	{
		text: "のみ",
		type: "Particle",
		englishTranslation: "only",
		uses: [
			{
				label: "Only",
				meaning: "A formal or written equivalent of だけ.",
				examples: ["予約のみ => reservations only"],
			},
		],
	},
	{
		text: "の",
		type: "Particle",
		englishTranslation: "possessive / nominalizer",
		uses: [
			{
				label: "Possession",
				meaning: "Links nouns, often like of or possessive 's.",
				examples: ["私の本 => my book"],
			},
			{
				label: "Nominalizer",
				meaning: "Turns a clause into a noun-like phrase.",
				examples: ["読むのが好き => I like reading"],
			},
		],
	},
	{
		text: "な",
		type: "Particle",
		englishTranslation: "na-adjective connector",
		uses: [
			{
				label: "Modifier",
				meaning: "Connects a na-adjective to the noun it modifies.",
				examples: ["静かな部屋 => a quiet room"],
			},
		],
	},
]

const particleDetailsByText = new Map(
	particleDetails.map((detail) => [detail.text, detail]),
)

export function getParticleDetail(element) {
	if (element?.elementType !== "particle") return null
	return particleDetailsByText.get(element.text) || null
}
