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

function hasPos(entry, tag) {
	return entry.sense?.some((s) => s.partOfSpeech?.includes(tag))
}

function getFirstKanji(entry) {
	const kanji = entry.kanji?.[0]?.text || entry.kana?.[0]?.text || ""
	const kana = entry.kana?.[0]?.text || ""

	if (kanji === "為る" && kana === "する") return "する"
	if (kanji === "来る") return "くる"
	if (kanji === "良い") return "いい"

	return kanji
}

function getFirstKana(entry) {
	const kana = entry.kana?.[0]?.text || ""

	if (kana === "よい") return "いい"

	return kana
}

function getStem(word, type) {
	if (!word) return ""

	if (
		type === "ichidan" ||
		type === "godan" ||
		type === "godan-iku" ||
		type === "kureru" ||
		type === "godan-aru" ||
		type === "i-type"
	) {
		return word.slice(0, -1)
	}

	if (type === "suru" || type === "kuru" || type === "ii") {
		return word.slice(0, -2)
	}

	return word
}

function getEnding(word, type) {
	if (!word) return ""

	if (
		type === "ichidan" ||
		type === "godan" ||
		type === "godan-iku" ||
		type === "kureru" ||
		type === "godan-aru" ||
		type === "i-type"
	) {
		return word.slice(-1)
	}

	if (type === "suru" || type === "kuru" || type === "ii") {
		return word.slice(-2)
	}

	return null
}

function isSuruVerb(entry) {
	const word = entry.kanji?.[0]?.text || entry.kana?.[0]?.text || ""

	// pure verbs
	if (word === "する" || word === "為る") return false

	// JMdict suru compounds are tagged vs BUT NOT vk
	const posList = entry.sense?.flatMap((s) => s.partOfSpeech || []) || []

	return posList.includes("vs") || posList.includes("vs-s")
}

// -------------------- MAPPING TYPES --------------------

function mapVerbType(wordTag) {
	if (wordTag === "v5aru") return "godan-aru"
	if (wordTag === "v5k-s") return "godan-iku"
	if (wordTag.startsWith("v5")) return "godan"
	if (wordTag === "v1") return "ichidan"
	if (wordTag === "v1-s") return "kureru"
	if (wordTag === "vk") return "kuru"
	if (wordTag.startsWith("vs")) return "suru"
	return null
}

function mapAdjectiveType(wordTag, kana) {
	if (wordTag === "adj-i") {
		if (kana === "いい") return "ii"
		return "i-type"
	}
	if (wordTag === "adj-na") return "na-type"
	return null
}

// -------------------- ADD ELEMENTS --------------------

function addVerb(wordTag, word, kana, entry) {
	const verbType = mapVerbType(wordTag)

	if (!verbType) return

	//if its a suru verb then add する on the end
	if (verbType === "suru" && isSuruVerb(entry)) {
		word += "する"
		kana += "する"
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
	})
}
function addAdjective(wordTag, word, kana) {
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
	})
}
function addPrefix(wordTag, word, kana) {
	if (wordTag === "pref") {
		output.prefixes.push({
			elementType: "prefix",
			text: word,
			textKana: kana,
		})
	}
}
function addSuffix(wordTag, word, kana) {
	if (wordTag === "suf") {
		output.suffixes.push({
			elementType: "suffix",
			text: word,
			textKana: kana,
		})
	}
}

function addCounter(wordTag, word) {
	if (wordTag === "ctr") {
		output.counters.push({
			elementType: "counter",
			text: word,
			number: "",
			particle: null,
		})
	}
}

function addAdverb(wordTag, word, kana) {
	if (wordTag.startsWith("adv")) {
		output.adverbs.push({
			elementType: "adverb",
			text: word,
			textKana: kana,
			particle: null,
		})
	}
}

function addNoun(wordTag, word, kana) {
	if (wordTag === "n") {
		output.nouns.push({
			elementType: "noun",
			text: word,
			textKana: kana,
			prefix: null,
			suffix: null,
			particle: null,
		})
	}
}
// -------------------- MAIN --------------------

function processJMdict() {
	const sourcePath = path.join(__dirname, "jmdict-eng-common.json")
	const outputPath = path.join(__dirname, "processed-jmdict.json")
	const JMdictJSON = JSON.parse(fs.readFileSync(sourcePath, "utf8"))

	for (const entry of JMdictJSON.words) {
		let word = getFirstKanji(entry)
		let kana = getFirstKana(entry)

		if (!word) continue

		const wordTags = [...new Set(entry.sense?.flatMap((s) => s.partOfSpeech || []) || [])]

		for (const wordTag of wordTags) {
			addVerb(wordTag, word, kana, entry)
			addAdjective(wordTag, word, kana)
			addPrefix(wordTag, word, kana)
			addSuffix(wordTag, word, kana)
			addCounter(wordTag, word)
			addAdverb(wordTag, word, kana)
			addNoun(wordTag, word, kana)
		}
	}

	fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8")

	console.log("Finished processing JMdict")
}

processJMdict()
