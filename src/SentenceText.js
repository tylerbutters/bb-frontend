import { useEffect, useState } from "react"

export default function SentenceText({ addedElements }) {
	const [sentenceString, setSentenceString] = useState()
	const [translation, setTranslation] = useState()

	useEffect(() => {
		const result = elementsToString(addedElements || [])
		setSentenceString(result)
		handleTranslate(result)
	}, [addedElements])

	async function handleTranslate(sentence) {
		const result = await translateJapanese(sentence)
		setTranslation(result)
	}

	return (
		<div className="sentenceTextContainer">
			<div> {sentenceString}</div>
			<div> {translation}</div>
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

function elementsToString(addedElements = []) {
	return addedElements.map(elementToString).join("")
}

function hasConjugation(element) {
	return element?.conjugation && Object.keys(element.conjugation).length > 0
}

function adjectiveToString(element) {
	return [
		element?.stem || "",
		hasConjugation(element) ? verbToString(element.conjugation) : "",
		element?.particle?.text || "",
	].join("")
}

function verbToString(element) {
	if (!element) return ""

	const shouldIncludeGodanEnding =
		element.verbType?.includes("godan") &&
		hasConjugation(element) &&
		element.ending !== element.conjugation?.stem

	return [
		element.stem || "",
		element.middleParticle?.text || "",
		shouldIncludeGodanEnding ? element.ending || "" : "",
		hasConjugation(element) ? verbToString(element.conjugation) : element.ending || "",
		element.particle?.text || "",
	].join("")
}

function nounToString(element) {
	return [
		element?.prefix?.text || "",
		element?.text || "",
		element?.suffix?.text || "",
		element?.particle?.text || "",
	].join("")
}

function adverbToString(element) {
	return [element?.text || "", element?.particle?.text || ""].join("")
}

function desuToString(element) {
	return [
		element?.noDesu?.text || "",
		hasConjugation(element) ? verbToString(element.conjugation) : "",
		element?.particle?.text || "",
	].join("")
}

function counterToString(element) {
	return [element?.number || "", element?.text || ""].join("")
}

function elementToString(element) {
	switch (element?.elementType) {
		case "noun":
			return nounToString(element)
		case "adjective":
			return adjectiveToString(element)
		case "verb":
			return verbToString(element)
		case "adverb":
			return adverbToString(element)
		case "desu":
			return desuToString(element)
		case "counter":
			return counterToString(element)
		case "punctuation":
			return element?.text || ""
		default:
			return ""
	}
}
