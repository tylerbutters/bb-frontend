const KANA_ROMAJI = {
	あ: "a",
	い: "i",
	う: "u",
	え: "e",
	お: "o",
	か: "ka",
	き: "ki",
	く: "ku",
	け: "ke",
	こ: "ko",
	さ: "sa",
	し: "shi",
	す: "su",
	せ: "se",
	そ: "so",
	た: "ta",
	ち: "chi",
	つ: "tsu",
	て: "te",
	と: "to",
	な: "na",
	に: "ni",
	ぬ: "nu",
	ね: "ne",
	の: "no",
	は: "ha",
	ひ: "hi",
	ふ: "fu",
	へ: "he",
	ほ: "ho",
	ま: "ma",
	み: "mi",
	む: "mu",
	め: "me",
	も: "mo",
	や: "ya",
	ゆ: "yu",
	よ: "yo",
	ら: "ra",
	り: "ri",
	る: "ru",
	れ: "re",
	ろ: "ro",
	わ: "wa",
	ゐ: "wi",
	ゑ: "we",
	を: "wo",
	ん: "n",
	が: "ga",
	ぎ: "gi",
	ぐ: "gu",
	げ: "ge",
	ご: "go",
	ざ: "za",
	じ: "ji",
	ず: "zu",
	ぜ: "ze",
	ぞ: "zo",
	だ: "da",
	ぢ: "ji",
	づ: "zu",
	で: "de",
	ど: "do",
	ば: "ba",
	び: "bi",
	ぶ: "bu",
	べ: "be",
	ぼ: "bo",
	ぱ: "pa",
	ぴ: "pi",
	ぷ: "pu",
	ぺ: "pe",
	ぽ: "po",
	ぁ: "a",
	ぃ: "i",
	ぅ: "u",
	ぇ: "e",
	ぉ: "o",
	ゃ: "ya",
	ゅ: "yu",
	ょ: "yo",
	ゎ: "wa",
	ゔ: "vu",
}

const KANA_COMBO_ROMAJI = {
	きゃ: "kya",
	きゅ: "kyu",
	きょ: "kyo",
	ぎゃ: "gya",
	ぎゅ: "gyu",
	ぎょ: "gyo",
	しゃ: "sha",
	しゅ: "shu",
	しょ: "sho",
	じゃ: "ja",
	じゅ: "ju",
	じょ: "jo",
	ちゃ: "cha",
	ちゅ: "chu",
	ちょ: "cho",
	ぢゃ: "ja",
	ぢゅ: "ju",
	ぢょ: "jo",
	にゃ: "nya",
	にゅ: "nyu",
	にょ: "nyo",
	ひゃ: "hya",
	ひゅ: "hyu",
	ひょ: "hyo",
	びゃ: "bya",
	びゅ: "byu",
	びょ: "byo",
	ぴゃ: "pya",
	ぴゅ: "pyu",
	ぴょ: "pyo",
	みゃ: "mya",
	みゅ: "myu",
	みょ: "myo",
	りゃ: "rya",
	りゅ: "ryu",
	りょ: "ryo",
	ふぁ: "fa",
	ふぃ: "fi",
	ふぇ: "fe",
	ふぉ: "fo",
	うぃ: "wi",
	うぇ: "we",
	うぉ: "wo",
	ゔぁ: "va",
	ゔぃ: "vi",
	ゔぇ: "ve",
	ゔぉ: "vo",
	てぃ: "ti",
	でぃ: "di",
	とぅ: "tu",
	どぅ: "du",
}

const SEARCH_VALUES_CACHE = new WeakMap()

function normalizeSearchValue(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
}

function toHiragana(text = "") {
	return text.replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
}

function getLastVowel(text) {
	const match = text.match(/[aeiou](?!.*[aeiou])/)
	return match?.[0] || ""
}

function getNextRomanSyllable(kana, index) {
	return KANA_COMBO_ROMAJI[kana.slice(index, index + 2)] || KANA_ROMAJI[kana[index]] || ""
}

function kanaToRomaji(text = "") {
	const kana = toHiragana(text)
	let romaji = ""

	for (let i = 0; i < kana.length; i++) {
		const char = kana[i]

		if (char === "っ") {
			const nextSyllable = getNextRomanSyllable(kana, i + 1)
			romaji += nextSyllable.match(/^[bcdfghjklmnpqrstvwxyz]/)?.[0] || ""
			continue
		}

		if (char === "ー") {
			romaji += getLastVowel(romaji)
			continue
		}

		const combo = KANA_COMBO_ROMAJI[kana.slice(i, i + 2)]
		if (combo) {
			romaji += combo
			i++
			continue
		}

		romaji += KANA_ROMAJI[char] || char
	}

	return romaji
}

function getRomajiSearchValues(value) {
	const romaji = kanaToRomaji(value)
	const shortVowels = romaji.replace(/([aeiou])\1+/g, "$1")

	return romaji === shortVowels ? [romaji] : [romaji, shortVowels]
}

function getOptionSearchValues(element) {
	if (!element || typeof element !== "object") return []

	const cachedSearchValues = SEARCH_VALUES_CACHE.get(element)
	if (cachedSearchValues) return cachedSearchValues

	const meanings = Array.isArray(element.meanings) ? element.meanings : []
	const textValues = [element.text, element.textKana, ...meanings]
	const romajiValues = [element.text, element.textKana].flatMap(getRomajiSearchValues)
	const searchValues = [...textValues, ...romajiValues]
		.filter(Boolean)
		.map(normalizeSearchValue)

	SEARCH_VALUES_CACHE.set(element, searchValues)
	return searchValues
}

function startsWithSearchWord(value, query) {
	return value.split(/[^a-z0-9]+/).some((word) => word.startsWith(query))
}

function getSearchRank(element, query) {
	const searchValues = getOptionSearchValues(element)

	if (searchValues.some((value) => value.startsWith(query))) return 0
	if (searchValues.some((value) => startsWithSearchWord(value, query))) return 1
	if (searchValues.some((value) => value.includes(query))) return 2

	return Number.POSITIVE_INFINITY
}

export function filterElementOptions(elementOptions = [], searchText = "") {
	const query = normalizeSearchValue(searchText)
	if (!query) return []

	return elementOptions
		.map((element, index) => ({
			element,
			index,
			rank: getSearchRank(element, query),
		}))
		.filter(({ rank }) => Number.isFinite(rank))
		.sort((a, b) => a.rank - b.rank || a.index - b.index)
		.map(({ element }) => element)
}
