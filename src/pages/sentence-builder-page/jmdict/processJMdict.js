import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const output = {
	adjectives: [],
	adverbs: [],
	verbs: [],
	nouns: [],
	prefixes: [],
	suffixes: [],
	counters: [],
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// -------------------- helpers --------------------

function getTextAndKana(entry, hasUsuallyKanaTag) {
	const kanji = entry.kanji?.[0]?.text || ""
	const kana = entry.kana?.[0]?.text || ""

	if (hasUsuallyKanaTag) {
		return {
			text: kana,
			kana: "",
		}
	}

	if (kanji) {
		return {
			text: kanji,
			kana,
		}
	}

	return {
		text: kana,
		kana: "",
	}
}

function getStem(word, type) {
	if (!word) return ""

	if (type === "suru" || type === "kuru" || type === "ii") {
		return word.slice(0, -2)
	}

	return word.slice(0, -1)
}

function getEnding(word, type) {
	if (!word) return ""

	if (type === "suru" || type === "kuru" || type === "ii") {
		return word.slice(-2)
	}

	return word.slice(-1)
}

function getMeanings(entry, wordTag) {
	const meanings = entry.sense
		?.filter((sense) => sense.partOfSpeech?.includes(wordTag))
		.flatMap((sense) => sense.gloss?.map((gloss) => gloss.text).filter(Boolean) || [])

	return [...new Set(meanings || [])]
}

// -------------------- MAPPING TYPES --------------------

function mapVerbType(wordTag) {
	if (wordTag === "v5aru") return "godan-haru"
	if (wordTag === "v5k-s") return "godan-iku"
	if (wordTag === "v5r-i") return "godan-aru"
	if (wordTag.startsWith("v5")) return "godan"
	if (wordTag === "v1") return "ichidan"
	if (wordTag === "v1-s") return "kureru"
	if (wordTag === "vk") return "kuru"
	if (wordTag.startsWith("vs")) return "suru"
	return null
}

function mapAdjectiveType(wordTag) {
	if (wordTag === "adj-ix") return "ii"
	if (wordTag === "adj-i") return "i-type"
	if (wordTag === "adj-na") return "na-type"
	return null
}

// -------------------- ADD ELEMENTS --------------------

function addVerb(wordTag, word, kana, entry) {
	const verbType = mapVerbType(wordTag)

	if (!verbType) return

	//if its a suru verb then add する on the end
	if (verbType === "suru" && !word.endsWith("する")) {
		word += "する"
		if (kana) kana += "する"
	}

	output.verbs.push({
		elementType: "verb",
		verbType,
		text: word,
		textKana: kana,
		stem: getStem(word, verbType),
		stemKana: getStem(kana, verbType),
		ending: getEnding(word, verbType),
		conjugation: null,
		particle: null,
		meanings: getMeanings(entry, wordTag),
	})
}
function addAdjective(wordTag, word, kana, entry) {
	const adjectiveType = mapAdjectiveType(wordTag)

	if (!adjectiveType) return

	output.adjectives.push({
		elementType: "adjective",
		adjectiveType,
		text: word,
		textKana: kana,
		stem: adjectiveType === "na-type" ? null : getStem(word, adjectiveType),
		stemKana: adjectiveType === "na-type" ? null : getStem(kana, adjectiveType),
		ending: adjectiveType === "na-type" ? null : getEnding(word, adjectiveType),
		conjugation: null,
		particle: null,
		meanings: getMeanings(entry, wordTag),
	})
}
function addPrefix(wordTag, word, kana, entry) {
	if (wordTag === "pref" || wordTag === "adj-pn") {
		output.prefixes.push({
			elementType: "prefix",
			text: word,
			textKana: kana,
			meanings: getMeanings(entry, wordTag),
		})
	}
}
function addSuffix(wordTag, word, kana, entry) {
	if (wordTag === "suf") {
		output.suffixes.push({
			elementType: "suffix",
			text: word,
			textKana: kana,
			meanings: getMeanings(entry, wordTag),
		})
	}
}

function addCounter(wordTag, word, entry) {
	if (wordTag === "ctr") {
		output.counters.push({
			elementType: "counter",
			text: word,
			number: "",
			particle: null,
			meanings: getMeanings(entry, wordTag),
		})
	}
}

function addAdverb(wordTag, word, kana, entry) {
	if (wordTag.startsWith("adv")) {
		output.adverbs.push({
			elementType: "adverb",
			text: word,
			textKana: kana,
			particle: null,
			meanings: getMeanings(entry, wordTag),
		})
	}
}

function addNoun(wordTag, word, kana, entry) {
	const nounTags = ["n", "pn", "n-t", "vs"]
	if (nounTags.includes(wordTag)) {
		output.nouns.push({
			elementType: "noun",
			text: word,
			textKana: kana,
			prefix: null,
			suffix: null,
			particle: null,
			meanings: getMeanings(entry, wordTag),
		})
	}
}
// -------------------- MAIN --------------------

function processJMdict() {
	const sourcePath = path.join(__dirname, "jmdict-eng-common.json")
	const outputDirectory = path.join(__dirname, "processed")
	const JMdictJSON = JSON.parse(fs.readFileSync(sourcePath, "utf8"))

	for (const entry of JMdictJSON.words) {
		const wordTags = [...new Set(entry.sense?.flatMap((s) => s.partOfSpeech || []) || [])]
		const miscTags = [...new Set(entry.sense?.flatMap((s) => s.misc || []) || [])]
		const hasUsuallyKanaTag = miscTags.includes("uk")
		const { text, kana } = getTextAndKana(entry, hasUsuallyKanaTag)

		for (const wordTag of wordTags) {
			addVerb(wordTag, text, kana, entry)
			addAdjective(wordTag, text, kana, entry)
			addPrefix(wordTag, text, kana, entry)
			addSuffix(wordTag, text, kana, entry)
			addCounter(wordTag, text, entry)
			addAdverb(wordTag, text, kana, entry)
			addNoun(wordTag, text, kana, entry)
		}
	}

	fs.mkdirSync(outputDirectory, { recursive: true })

	for (const [elementType, elements] of Object.entries(output)) {
		const outputPath = path.join(outputDirectory, `${elementType}.json`)
		fs.writeFileSync(outputPath, JSON.stringify(elements, null, 2), "utf8")
	}

	console.log("Finished processing JMdict")
}

processJMdict()
