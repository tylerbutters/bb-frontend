import { Fragment, useEffect, useMemo, useState } from "react"
import { translateJapanese as requestJapaneseTranslation } from "../../../api/games"
import type { RequestOptions } from "../../../api/types"
import type { SentenceElement } from "../types"
import JapaneseText from "./JapaneseText"
import "./SentenceText.css"

interface SentenceTextProps {
	addedElements?: SentenceElement[]
	showTranslation?: boolean
}

interface TextPart {
	text: string
	reading?: string
}

type SentenceTextElement = Omit<SentenceElement, "conjugation" | "particle"> & {
	conjugation?: SentenceTextElement | null
	middleParticle?: SentenceTextElement | null
	noDesu?: SentenceTextElement | null
	particle?: SentenceTextElement | null
	prefix?: SentenceTextElement | null
	suffix?: SentenceTextElement | null
}

export default function SentenceText({ addedElements, showTranslation = true }: SentenceTextProps) {
	const [translation, setTranslation] = useState<string | null>("")
	const sentenceParts = useMemo(() => elementsToTextParts(addedElements || []), [addedElements])
	const sentenceString = useMemo(() => textPartsToString(sentenceParts), [sentenceParts])

	useEffect(() => {
		if (!showTranslation) {
			setTranslation("")
			return
		}

		const controller = new AbortController()
		handleTranslate(sentenceString, controller.signal)

		return () => {
			controller.abort()
		}
	}, [sentenceString, showTranslation])

	async function handleTranslate(sentence: string, signal: AbortSignal) {
		if (!sentence) {
			setTranslation("")
			return
		}

		const result = await translateJapanese(sentence, { signal })
		if (signal.aborted) return
		setTranslation(result)
	}

	return (
		<div className="sentenceTextContainer">
			{showTranslation && <div className="sentenceTranslationText">{translation}</div>}
			<div className="sentenceJapaneseText">
				{sentenceParts.map((part, index) => (
					<Fragment key={`${part.text}:${index}`}>
						<JapaneseText text={part.text} reading={part.reading} />
					</Fragment>
				))}
			</div>
		</div>
	)
}

export async function translateJapanese(text: string, options: RequestOptions = {}) {
	try {
		return await requestJapaneseTranslation(text, options)
	} catch (error) {
		return null
	}
}

export function elementsToTextParts(addedElements: SentenceElement[] = []): TextPart[] {
	return addedElements.flatMap(elementToTextParts)
}

export function textPartsToString(parts: TextPart[] = []) {
	return parts.map((part) => part.text).join("")
}

function textPart(text: unknown, reading?: unknown): TextPart[] {
	if (!text) return []
	return [{ text: String(text), reading: reading ? String(reading) : undefined }]
}

function plainTextPart(text: unknown) {
	return textPart(text)
}

function isSentenceTextElement(value: unknown): value is SentenceTextElement {
	return Boolean(value) && typeof value === "object"
}

function getConjugation(element?: SentenceTextElement | null) {
	const conjugation = element?.conjugation
	if (!isSentenceTextElement(conjugation) || Object.keys(conjugation).length === 0) return null
	return conjugation
}

function adjectiveToTextParts(element: SentenceTextElement) {
	const conjugation = getConjugation(element)
	const shouldUseStem = Boolean(conjugation)
	const text = shouldUseStem ? element?.stem || element?.text : element?.text || element?.stem
	const reading = shouldUseStem
		? element?.stemKana || element?.textKana
		: element?.textKana || element?.stemKana
	const isIi = element.adjectiveType === "ii"

	return [
		...(isIi ? [] : textPart(text, reading)),
		...(conjugation ? verbToTextParts(conjugation) : []),
		...plainTextPart(element?.particle?.text),
	]
}

function verbToTextParts(element?: SentenceTextElement | null): TextPart[] {
	if (!element) return []

	const conjugation = getConjugation(element)

	if (conjugation?.replacesParent) {
		return [
			...plainTextPart(element.middleParticle?.text),
			...verbToTextParts(conjugation),
			...plainTextPart(element.particle?.text),
		]
	}

	const verbType = typeof element.verbType === "string" ? element.verbType : ""
	const shouldIncludeGodanEnding =
		verbType.includes("godan") &&
		Boolean(conjugation) &&
		element.ending !== conjugation?.stem

	return [
		...textPart(element.stem, element.stemKana),
		...plainTextPart(element.middleParticle?.text),
		...(shouldIncludeGodanEnding ? plainTextPart(element.ending) : []),
		...(conjugation ? verbToTextParts(conjugation) : plainTextPart(element.ending)),
		...plainTextPart(element.particle?.text),
	]
}

function nounToTextParts(element: SentenceTextElement) {
	return [
		...textPart(element?.prefix?.text, element?.prefix?.textKana),
		...textPart(element?.text, element?.textKana),
		...textPart(element?.suffix?.text, element?.suffix?.textKana),
		...plainTextPart(element?.particle?.text),
	]
}

function adverbToTextParts(element: SentenceTextElement) {
	return [...textPart(element?.text, element?.textKana), ...plainTextPart(element?.particle?.text)]
}

function desuToTextParts(element: SentenceTextElement) {
	const conjugation = getConjugation(element)

	return [
		...plainTextPart(element?.noDesu?.text),
		...(conjugation ? verbToTextParts(conjugation) : []),
		...plainTextPart(element?.particle?.text),
	]
}

function counterToTextParts(element: SentenceTextElement) {
	return [...plainTextPart(element?.number), ...textPart(element?.text, element?.textKana)]
}

function elementToTextParts(element: SentenceElement): TextPart[] {
	const textElement = element as SentenceTextElement

	switch (textElement?.elementType) {
		case "noun":
			return nounToTextParts(textElement)
		case "adjective":
			return adjectiveToTextParts(textElement)
		case "verb":
			return verbToTextParts(textElement)
		case "adverb":
			return adverbToTextParts(textElement)
		case "desu":
			return desuToTextParts(textElement)
		case "counter":
			return counterToTextParts(textElement)
		case "punctuation":
			return plainTextPart(textElement?.text)
		default:
			return []
	}
}
