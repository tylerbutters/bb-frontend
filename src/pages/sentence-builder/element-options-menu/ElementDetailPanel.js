import { toRomaji } from "wanakana"
import JapaneseText from "../components/JapaneseText"
import { getConjugationDetail } from "../grammar/conjugationDetailsData"
import { getParticleDetail } from "../grammar/particleDetailsData"
import "./ElementDetailPanel.css"

const VOCABULARY_TYPES = new Set([
	"noun",
	"verb",
	"adjective",
	"adverb",
	"counter",
	"prefix",
	"suffix",
])

const VOCABULARY_TYPE_LABELS = {
	noun: "Noun",
	verb: "Verb",
	adjective: "Adjective",
	adverb: "Adverb",
	counter: "Counter",
	prefix: "Prefix",
	suffix: "Suffix",
	desu: "Copula",
}

export function getElementDetail(element) {
	const conjugationDetail = getConjugationDetail(element)
	if (conjugationDetail) {
		return {
			kind: "conjugation",
			...conjugationDetail,
		}
	}

	const vocabularyDetail = getVocabularyDetail(element)
	if (vocabularyDetail) return vocabularyDetail

	const particleDetail = getParticleDetail(element)
	if (particleDetail) {
		return {
			kind: "particle",
			...particleDetail,
		}
	}

	return null
}

export default function ElementDetailPanel({ element, isOpen, panelRef, style }) {
	const detail = getElementDetail(element)
	if (!detail) return null

	return (
		<aside
			ref={panelRef}
			popover="manual"
			className={`elementDetailPanel ${
				isOpen ? "elementDetailPanelOpen" : "elementDetailPanelClosing"
			}`}
			style={style}
		>
			<ElementDetailPanelContent detail={detail} />
		</aside>
	)
}

export function ElementDetailPanelContent({ detail: providedDetail, element }) {
	const detail = providedDetail || getElementDetail(element)
	if (!detail) return null

	return (
		<>
			{detail.kind === "conjugation" && <ConjugationDetail detail={detail} />}
			{detail.kind === "vocabulary" && <VocabularyDetail detail={detail} />}
			{detail.kind === "particle" && <ParticleDetail detail={detail} />}
		</>
	)
}

function VocabularyDetail({ detail }) {
	return (
		<div className="elementDetailContent">
			<div className="elementDetailHeader">
				<span className="elementDetailType">{detail.type}</span>
				<span className="elementDetailName">
					<JapaneseText text={detail.word} reading={detail.kana} />
				</span>
				<span className="elementDetailTranslation">{detail.romaji}</span>
			</div>
			<div className="elementDetailSection">
				<div className="elementDetailTranslations">{detail.translations.join("; ")}</div>
			</div>
		</div>
	)
}

function ConjugationDetail({ detail }) {
	return (
		<div className="elementDetailContent">
			<div className="elementDetailHeader">
				<span className="elementDetailType">{detail.type}</span>
				<span className="elementDetailName">{detail.grammaticalName}</span>
				{detail.englishTranslation && (
					<span className="elementDetailTranslation">{detail.englishTranslation}</span>
				)}
			</div>

			<div className="elementDetailSection">
				<div className="elementDetailConstructions">
					{detail.constructions.map((construction) => (
						<div
							key={`${construction.label}:${construction.construction}`}
							className="elementDetailConstruction"
						>
							<div className="elementDetailConstructionFormula">
								<span className="elementDetailConstructionLabel">{construction.label}:</span>{" "}
								{construction.construction}
							</div>
							<div className="elementDetailExamples">
								{construction.examples.map((example) => (
									<div key={getExampleKey(example)}>
										<ExampleText example={example} />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function ParticleDetail({ detail }) {
	return (
		<div className="elementDetailContent">
			<div className="elementDetailHeader">
				<span className="elementDetailType">{detail.type}</span>
				<span className="elementDetailName">{detail.text}</span>
				<span className="elementDetailTranslation">{detail.englishTranslation}</span>
			</div>

			<div className="elementDetailSection">
				<div className="elementDetailConstructions">
					{detail.uses.map((use) => (
						<div key={use.label} className="elementDetailConstruction">
							<div className="elementDetailConstructionFormula">
								<span className="elementDetailConstructionLabel">{use.label}:</span>{" "}
								{use.meaning}
							</div>
							<div className="elementDetailExamples">
								{use.examples.map((example) => (
									<div key={example}>
										<ExampleText example={example} />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function ExampleText({ example }) {
	if (isConjugationExample(example)) {
		return (
			<ConjugationExample
				base={example.base}
				conjugation={example.conjugation}
			/>
		)
	}

	const translationExample = parseTranslationExample(String(example))
	if (translationExample) {
		return (
			<>
				{translationExample.japanese}{" "}
				<span className="elementDetailExampleTranslation">
					({translationExample.english})
				</span>
			</>
		)
	}

	return String(example)
}

function ConjugationExample({ base, conjugation }) {
	if (!base) return conjugation

	const stemLength = getSharedPrefixLength(base, conjugation)
	return (
		<>
			<ConjugationExampleWord text={base} stemLength={stemLength} />
			{" → "}
			<ConjugationExampleWord text={conjugation} stemLength={stemLength} />
		</>
	)
}

function ConjugationExampleWord({ text, stemLength }) {
	const characters = Array.from(text)
	const stem = characters.slice(0, stemLength).join("")
	const ending = characters.slice(stemLength).join("")

	if (!ending) return text

	return (
		<>
			{stem}
			<strong className="elementDetailConjugationEnding">{ending}</strong>
		</>
	)
}

function getExampleKey(example) {
	if (isConjugationExample(example)) {
		return [example.base, example.conjugation].filter(Boolean).join(" → ")
	}

	return String(example)
}

function isConjugationExample(example) {
	return Boolean(
		example &&
			typeof example === "object" &&
			typeof example.conjugation === "string",
	)
}

function parseTranslationExample(text) {
	const [japanese, english, extra] = text.split(/\s*=>\s*/)
	if (!japanese || !english || extra !== undefined) return null

	return {
		type: "translation",
		japanese,
		english,
	}
}

function getSharedPrefixLength(base, conjugation) {
	const baseCharacters = Array.from(base)
	const conjugationCharacters = Array.from(conjugation)
	const shortestLength = Math.min(baseCharacters.length, conjugationCharacters.length)

	for (let index = 0; index < shortestLength; index += 1) {
		if (baseCharacters[index] !== conjugationCharacters[index]) return index
	}

	return shortestLength
}

function getVocabularyDetail(element) {
	if (!element || !VOCABULARY_TYPES.has(element.elementType)) return null
	if (!element.text || !element.meanings?.length) return null

	const kana = element.textKana || element.text
	const romaji = toRomaji(kana)

	return {
		kind: "vocabulary",
		type: VOCABULARY_TYPE_LABELS[element.elementType] || element.elementType,
		word: element.text,
		kana,
		hasReading: Boolean(element.textKana && element.textKana !== element.text),
		romaji,
		translations: element.meanings,
	}
}
