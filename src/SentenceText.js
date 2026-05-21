import { Fragment, useEffect, useMemo, useState } from "react"
import JapaneseText from "./components/JapaneseText"

export default function SentenceText({ addedElements }) {
	const [translation, setTranslation] = useState()
	const sentenceParts = useMemo(() => elementsToTextParts(addedElements || []), [addedElements])
	const sentenceString = useMemo(() => textPartsToString(sentenceParts), [sentenceParts])

	useEffect(() => {
		handleTranslate(sentenceString)
	}, [sentenceString])

	async function handleTranslate(sentence) {
		if (!sentence) {
			setTranslation("")
			return
		}

		const result = await translateJapanese(sentence)
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
			<div className="sentenceJapaneseText">{translation}</div>
		</div>
	)
}

async function translateJapanese(text) {
	try {
		const response = await fetch(
			"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=" +
				encodeURIComponent(text),
		)
		const data = await response.json()
		return data[0].map((item) => item[0]).join("")
	} catch (error) {
		console.log(error)
		return null
	}
}

function elementsToTextParts(addedElements = []) {
	return addedElements.flatMap(elementToTextParts)
}

function textPartsToString(parts = []) {
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
