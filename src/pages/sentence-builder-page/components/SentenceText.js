import { Fragment, useEffect, useMemo, useState } from "react"
import { translateJapanese as requestJapaneseTranslation } from "../../../api/games"
import JapaneseText from "./JapaneseText"
import "./SentenceText.css"

export default function SentenceText({ addedElements, showTranslation = true }) {
	const [translation, setTranslation] = useState()
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

	async function handleTranslate(sentence, signal) {
		if (!sentence) {
			setTranslation("")
			return
		}

		const result = await translateJapanese(sentence, { signal })
		console.log(result)
		if (signal.aborted) return
		setTranslation(result)
	}

	return (
		<div className="sentenceTextContainer">
			<div className="sentenceJapaneseText">
				{sentenceParts.map((part, index) => (
					<Fragment key={`${part.text}:${index}`}>
						<JapaneseText text={part.text} reading={part.reading} />
					</Fragment>
				))}
			</div>
			{showTranslation && <div className="sentenceJapaneseText">{translation}</div>}
		</div>
	)
}

export async function translateJapanese(text, options = {}) {
	try {
		return await requestJapaneseTranslation(text, options)
	} catch (error) {
		if (error.name !== "AbortError") {
			console.log(error)
		}
		return null
	}
}

export function elementsToTextParts(addedElements = []) {
	return addedElements.flatMap(elementToTextParts)
}

export function textPartsToString(parts = []) {
	return parts.map((part) => part.text).join("")
}

function textPart(text, reading) {
	if (!text) return []
	return [{ text, reading }]
}

function plainTextPart(text) {
	return textPart(text)
}

function hasConjugation(element) {
	return element?.conjugation && Object.keys(element.conjugation).length > 0
}

function adjectiveToTextParts(element) {
	const shouldUseStem = hasConjugation(element)
	const text = shouldUseStem ? element?.stem || element?.text : element?.text || element?.stem
	const reading = shouldUseStem
		? element?.stemKana || element?.textKana
		: element?.textKana || element?.stemKana

	return [
		...textPart(text, reading),
		...(hasConjugation(element) ? verbToTextParts(element.conjugation) : []),
		...plainTextPart(element?.particle?.text),
	]
}

function verbToTextParts(element) {
	if (!element) return []

	if (element.conjugation?.replacesParent) {
		return [
			...plainTextPart(element.middleParticle?.text),
			...verbToTextParts(element.conjugation),
			...plainTextPart(element.particle?.text),
		]
	}

	const shouldIncludeGodanEnding =
		element.verbType?.includes("godan") &&
		hasConjugation(element) &&
		element.ending !== element.conjugation?.stem

	return [
		...textPart(element.stem, element.stemKana),
		...plainTextPart(element.middleParticle?.text),
		...(shouldIncludeGodanEnding ? plainTextPart(element.ending) : []),
		...(hasConjugation(element)
			? verbToTextParts(element.conjugation)
			: plainTextPart(element.ending)),
		...plainTextPart(element.particle?.text),
	]
}

function nounToTextParts(element) {
	return [
		...textPart(element?.prefix?.text, element?.prefix?.textKana),
		...textPart(element?.text, element?.textKana),
		...textPart(element?.suffix?.text, element?.suffix?.textKana),
		...plainTextPart(element?.particle?.text),
	]
}

function adverbToTextParts(element) {
	return [...textPart(element?.text, element?.textKana), ...plainTextPart(element?.particle?.text)]
}

function desuToTextParts(element) {
	return [
		...plainTextPart(element?.noDesu?.text),
		...(hasConjugation(element) ? verbToTextParts(element.conjugation) : []),
		...plainTextPart(element?.particle?.text),
	]
}

function counterToTextParts(element) {
	return [...plainTextPart(element?.number), ...textPart(element?.text, element?.textKana)]
}

function elementToTextParts(element) {
	switch (element?.elementType) {
		case "noun":
			return nounToTextParts(element)
		case "adjective":
			return adjectiveToTextParts(element)
		case "verb":
			return verbToTextParts(element)
		case "adverb":
			return adverbToTextParts(element)
		case "desu":
			return desuToTextParts(element)
		case "counter":
			return counterToTextParts(element)
		case "punctuation":
			return plainTextPart(element?.text)
		default:
			return []
	}
}
