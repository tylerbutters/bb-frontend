import { toRomaji } from "wanakana"
import type { ElementOption } from "../types"

// Search values are derived from dictionary entries, so cache them per element
// instead of rebuilding romaji and meaning aliases on every keystroke.
const SEARCH_VALUES_CACHE = new WeakMap<object, string[]>()

function normalizeSearchValue(value: unknown) {
	return String(value || "")
		.trim()
		.toLowerCase()
}

function uniqueSearchValues(values: string[]) {
	return Array.from(new Set(values.filter(Boolean)))
}

function removeParentheticalNotes(value: string) {
	return value
		.replace(/\s*\([^)]*\)/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function removeLeadingInfinitiveMarker(value: string) {
	return value.replace(/^to\s+/, "")
}

function getMeaningSearchValues(meaning: string) {
	const normalizedMeaning = normalizeSearchValue(meaning)
	const meaningWithoutNotes = removeParentheticalNotes(normalizedMeaning)
	const meaningWithoutInfinitive = removeLeadingInfinitiveMarker(meaningWithoutNotes)

	// Dictionary meanings often include notes like "water (esp. cool or cold)"
	// or infinitives like "to eat". Keep those searchable, but add cleaner
	// aliases so common English searches rank the base word first.
	return uniqueSearchValues([
		meaningWithoutInfinitive,
		meaningWithoutNotes,
		normalizedMeaning,
	])
}

function getRomajiSearchValues(value: unknown) {
	const romaji = toRomaji(String(value || ""))
	const shortVowels = romaji.replace(/([aeiou])\1+/g, "$1")

	// Wanakana keeps long vowels, but users often type shortened romaji
	// searches. Include both so "gakkou" and "gakko" can match 学校.
	return romaji === shortVowels ? [romaji] : [romaji, shortVowels]
}

function getOptionSearchValues(element: ElementOption) {
	if (!element || typeof element !== "object") return []

	const cachedSearchValues = SEARCH_VALUES_CACHE.get(element)
	if (cachedSearchValues) return cachedSearchValues

	const meanings = Array.isArray(element.meanings) ? element.meanings : []
	const meaningValues = meanings.flatMap(getMeaningSearchValues)
	const textValues = [element.text, element.textKana, ...meaningValues]
	const romajiValues = [element.text, element.textKana].flatMap(getRomajiSearchValues)
	const searchValues = [...textValues, ...romajiValues]
		.filter(Boolean)
		.map(normalizeSearchValue)

	SEARCH_VALUES_CACHE.set(element, searchValues)
	return searchValues
}

function startsWithSearchWord(value: string, query: string) {
	return value.split(/[^a-z0-9]+/).some((word) => word.startsWith(query))
}

function hasExactSearchWord(value: string, query: string) {
	return value.split(/[^a-z0-9]+/).some((word) => word === query)
}

interface SearchScore {
	rank: number
	length: number
	valueIndex: number
}

function createSearchScore(rank: number, value: string, valueIndex: number): SearchScore {
	return {
		rank,
		length: value.length,
		valueIndex,
	}
}

function getBetterScore(first: SearchScore, second: SearchScore) {
	if (first.rank !== second.rank) return first.rank < second.rank ? first : second
	if (first.length !== second.length) return first.length < second.length ? first : second
	return first.valueIndex < second.valueIndex ? first : second
}

function getValueSearchScore(value: string, query: string, valueIndex: number): SearchScore {
	// Lower rank numbers are better. Exact matches need to beat longer prefix
	// matches, so "kare" finds 彼 before words like かれる or かれら.
	if (value === query) return createSearchScore(0, value, valueIndex)
	if (hasExactSearchWord(value, query)) return createSearchScore(1, value, valueIndex)
	if (value.startsWith(query)) return createSearchScore(2, value, valueIndex)
	if (startsWithSearchWord(value, query)) return createSearchScore(3, value, valueIndex)
	if (value.includes(query)) return createSearchScore(4, value, valueIndex)

	return {
		rank: Number.POSITIVE_INFINITY,
		length: Number.POSITIVE_INFINITY,
		valueIndex,
	}
}

function getSearchScore(element: ElementOption, query: string) {
	const searchValues = getOptionSearchValues(element)

	return searchValues.reduce((bestScore, value, valueIndex) => {
		const score = getValueSearchScore(value, query, valueIndex)
		return getBetterScore(bestScore, score)
	}, {
		rank: Number.POSITIVE_INFINITY,
		length: Number.POSITIVE_INFINITY,
		valueIndex: Number.POSITIVE_INFINITY,
	})
}

export function filterElementOptions<Element extends ElementOption>(
	elementOptions: Element[] = [],
	searchText = "",
): Element[] {
	const query = normalizeSearchValue(searchText)
	if (!query) return []

	return elementOptions
		.map((element, index) => ({
			element,
			index,
			score: getSearchScore(element, query),
		}))
		.filter(({ score }) => Number.isFinite(score.rank))
		.sort(
			(a, b) =>
				a.score.rank - b.score.rank ||
				a.score.length - b.score.length ||
				a.score.valueIndex - b.score.valueIndex ||
				// Keep dictionary order as the final tie-breaker so equal matches
				// stay stable and predictable between searches.
				a.index - b.index,
		)
		.map(({ element }) => element)
}
