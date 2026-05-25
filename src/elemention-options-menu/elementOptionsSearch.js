import { toRomaji } from "wanakana"

const SEARCH_VALUES_CACHE = new WeakMap()

function normalizeSearchValue(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
}

function getRomajiSearchValues(value) {
	const romaji = toRomaji(String(value || ""))
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
