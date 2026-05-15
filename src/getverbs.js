import fs from "fs"
import { XMLParser } from "fast-xml-parser"

const xml = fs.readFileSync("./JMdict_e", "utf8")

const parser = new XMLParser({
	processEntities: false,
	ignoreAttributes: false,
})

const data = parser.parse(xml)
const entries = data?.JMdict?.entry || []

function asArray(v) {
	if (!v) return []
	return Array.isArray(v) ? v : [v]
}

function clean(v) {
	return typeof v === "string" ? v.replace(/&|;/g, "") : ""
}

/**
 * Common word detection
 */
function isCommon(entry) {
	const k = asArray(entry?.k_ele)
	const r = asArray(entry?.r_ele)

	const COMMON = new Set(["ichi1", "ichi2", "news1", "news2", "spec1", "spec2"])

	for (const x of [...k, ...r]) {
		const pri = [...asArray(x?.ke_pri), ...asArray(x?.re_pri)]

		for (const p of pri) {
			if (COMMON.has(clean(p))) {
				return true
			}
		}
	}

	return false
}

/**
 * Verb classification
 */
function detectVerb(entry) {
	const senses = asArray(entry?.sense)

	for (const s of senses) {
		const pos = asArray(s?.pos)

		for (const p of pos) {
			const c = clean(p)

			if (c === "v1") return "ichidan"
			if (c.startsWith("v5")) return "godan"
			if (c === "vk") return "kuru"
			if (c === "vs" || c === "vs-i") return "suru"
		}
	}

	return null
}

const verbs = []

for (const entry of entries) {
	const verbType = detectVerb(entry)

	if (!verbType) continue
	if (!isCommon(entry)) continue

	const kanjiList = asArray(entry?.k_ele)
	const readingList = asArray(entry?.r_ele)

	const kanji = kanjiList[0]?.keb || null
	const reading = readingList[0]?.reb || null

	if (!kanji && !reading) continue

	const word = kanji || reading
	const kana = reading || kanji

	let stem = ""
	let stemKana = ""
	let ending = ""

	// SURU
	if (verbType === "suru") {
		ending = "する"

		stem = word.slice(0, -2)
		stemKana = kana.slice(0, -2)
	}

	// KURU
	else if (verbType === "kuru") {
		ending = "くる"

		stem = word === "来る" ? "来" : word.slice(0, -2)
		stemKana = kana.slice(0, -2)
	}

	// GODAN / ICHIDAN
	else {
		ending = word.slice(-1)

		stem = word.slice(0, -1)
		stemKana = kana.slice(0, -1)
	}

	verbs.push({
		type: "verb",
		word,
		kana,
		stem,
		stemKana,
		ending,
		verbType,
	})
}

console.log("VERBS:", verbs.length)
console.log("SAMPLE:\n", verbs[0])

fs.writeFileSync("./src/verbs.json", JSON.stringify(verbs, null, 2))
