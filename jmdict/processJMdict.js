import fs from "fs"

const output = {
	adjectives: [],
	adverbs: [],
	verbs: [],
	nouns: [],
	affixes: [],
	counters: [],
	auxiliaries: [],
}

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
		type === "iku" ||
		type === "kureru" ||
		type === "honorific-aru" ||
		type === "i-type"
	) {
		return word.slice(0, -1)
	}

	if (word === "する" || word === "くる" || word === "いい") {
		return null
	}

	return word
}

function getEnding(word, type) {
	if (!word) return ""

	if (
		type === "ichidan" ||
		type === "godan" ||
		type === "iku" ||
		type === "kureru" ||
		type === "honorific-aru" ||
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
	if (wordTag === "v1") return "ichidan"
	if (wordTag === "v1-s") return "kureru"
	if (wordTag.startsWith("v5")) return "godan"
	if (wordTag.startsWith("v5k-s")) return "iku"
	if (wordTag === "vk") return "kuru"
	if (wordTag.startsWith("vs")) return "suru"
	if (wordTag === "v5aru") return "honorific-aru"
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

function mapAffixType(wordTag) {
	if (wordTag === "pref") return "prefix"
	if (wordTag === "suf") return "suffix"
	return null
}

function mapAuxType(wordTag) {
	if (wordTag === "aux-v" || wordTag === "aux") return "verb"
	if (wordTag === "aux-adj") return "adjective"
	return null
}

// -------------------- ADD ELEMENTS --------------------

function addVerb(wordTag, word, kana, entry) {
	const verbType = mapVerbType(wordTag)
	const auxType = mapAuxType(wordTag)
	let list

	if (verbType) {
		//if its a suru verb then add する on the end
		if (verbType === "suru" && isSuruVerb(entry)) {
			word += "する"
			kana += "する"
		}
		list = output.verbs
	} else if (auxType && auxType === "verb") list = output.auxiliaries
	else return

	list.push({
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
	const adjectiveType = mapAdjectiveType(wordTag, kana)
	const auxType = mapAuxType(wordTag)
	let list

	if (adjectiveType) list = output.adjectives
	else if (auxType && auxType === "adjective") list = output.auxiliaries
	else return

	list.push({
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
function addAffix(wordTag, word, kana) {
	const affixType = mapAffixType(wordTag)
	if (affixType) {
		output.affixes.push({
			elementType: "affix",
			affixType,
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
	const JMdictJSON = JSON.parse(fs.readFileSync("./jmdict/jmdict-eng-common.json", "utf8"))

	for (const entry of JMdictJSON.words) {
		let word = getFirstKanji(entry)
		let kana = getFirstKana(entry)

		if (!word) continue

		const wordTags = entry.sense?.flatMap((s) => s.partOfSpeech || []) || []

		for (const wordTag of wordTags) {
			addVerb(wordTag, word, kana, entry)
			addAdjective(wordTag, word, kana)
			addAffix(wordTag, word, kana)
			addCounter(wordTag, word)
			addAdverb(wordTag, word, kana)
			addNoun(wordTag, word, kana)
		}
	}

	fs.writeFileSync("./jmdict/processed-jmdict.json", JSON.stringify(output, null, 2), "utf8")

	console.log(`Finished processing JMdict, count: ${count}`)
}

processJMdict()
