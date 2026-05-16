import fs from "fs"

// -------------------- load JSON --------------------

const JMdictJSON = JSON.parse(fs.readFileSync("./jmdict/jmdict-eng-common.json", "utf8"))

// -------------------- output --------------------

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

function mapVerbType(pos) {
	if (pos === "v1") return "ichidan"
	if (pos === "v1-s") return "kureru"
	if (pos.startsWith("v5")) return "godan"
	if (pos.startsWith("v5k-s")) return "iku"
	if (pos === "vk") return "kuru"
	if (pos.startsWith("vs")) return "suru"
	if (pos === "v5aru") return "honorific-aru"
	return null
}

function mapAdjectiveType(pos, kana) {
	if (pos === "adj-i") {
		if (kana === "いい") return "ii"
		return "i-type"
	}
	if (pos === "adj-na") return "na-type"
	return null
}

// -------------------- main --------------------

function processJMdict() {
	const LIMIT = 100
	let count = 0

	for (const entry of JMdictJSON.words) {
		if (count >= LIMIT) break

		let word = getFirstKanji(entry)
		let kana = getFirstKana(entry)

		if (!word) continue

		count++

		const posList = entry.sense?.flatMap((s) => s.partOfSpeech || []) || []

		// ---------------- VERBS ----------------
		for (const pos of posList) {
			const verbType = mapVerbType(pos)
			if (!verbType) continue

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

			break
		}

		// ---------------- ADJECTIVES ----------------
		for (const pos of posList) {
			const adjectiveType = mapAdjectiveType(pos, kana)
			if (!adjectiveType) continue

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

			break
		}

		// ---------------- ADVERBS ----------------
		if (posList.some((p) => p.startsWith("adv"))) {
			output.adverbs.push({
				elementType: "adverb",
				text: word,
				textKana: kana,
				particle: null,
			})
		}

		// ---------------- NOUNS ----------------
		if (posList.includes("n")) {
			output.nouns.push({
				elementType: "noun",
				text: word,
				textKana: kana,
				prefix: null,
				suffix: null,
				particle: null,
			})
		}

		// ---------------- DEBUG ----------------
		console.log("ORIGINAL ENTRY")
		console.log({
			word,
			kana,
			posList,
			meaning: entry.sense?.[0]?.gloss?.[0]?.text,
		})
	}

	fs.writeFileSync("./jmdict/processed-jmdict.json", JSON.stringify(output, null, 2), "utf8")
	console.log("TRANSFORMED VERB")
	console.log(output)
	console.log(`Finished processing JMdict, count: ${count}`)
}

processJMdict()
