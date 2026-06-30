import { toRomaji } from "wanakana"
import type { ReactNode } from "react"
import JapaneseText from "../components/JapaneseText"
import { getConjugationDetail } from "../grammar/conjugationDetailsData"
import { getParticleDetail } from "../grammar/particleDetailsData"
import "./DetailPanel.css"

const VOCABULARY_TYPES = new Set([
	"noun",
	"verb",
	"adjective",
	"adverb",
	"counter",
	"prefix",
	"suffix",
])

const VOCABULARY_TYPE_LABELS: Record<string, string> = {
	noun: "Noun",
	verb: "Verb",
	adjective: "Adjective",
	adverb: "Adverb",
	counter: "Counter",
	prefix: "Prefix",
	suffix: "Suffix",
	desu: "Copula",
}

export function getElementDetail(element: any): any {
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

export function DetailPanelContent({ detail: providedDetail, element }: { detail?: any; element?: any }) {
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

function VocabularyDetail({ detail }: { detail: any }) {
	return (
		<div className="elementDetailContent">
			<DetailHeader
				type={detail.type}
				name={<JapaneseText text={detail.word} reading={detail.kana} />}
				translation={detail.romaji}
			/>
			<div className="elementDetailSection">
				<div className="elementDetailTranslations">{detail.translations.join("; ")}</div>
			</div>
		</div>
	)
}

function ConjugationDetail({ detail }: { detail: any }) {
	return (
		<div className="elementDetailContent">
			<DetailHeader
				type={detail.type}
				name={detail.grammaticalName}
				translation={detail.englishTranslation}
			/>

			<div className="elementDetailSection">
				<div className="elementDetailConstructions">
					{detail.constructions.map((construction: any) => (
						<DetailConstruction
							key={`${construction.label}:${construction.construction}`}
							label={construction.label}
							body={construction.construction}
							examples={construction.examples}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

function ParticleDetail({ detail }: { detail: any }) {
	return (
		<div className="elementDetailContent">
			<DetailHeader
				type={detail.type}
				name={detail.text}
				translation={detail.englishTranslation}
			/>

			<div className="elementDetailSection">
				<div className="elementDetailConstructions">
					{detail.uses.map((particleUse: any) => (
						<DetailConstruction
							key={particleUse.label}
							label={particleUse.label}
							body={particleUse.meaning}
							examples={particleUse.examples}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

function DetailHeader({
	type,
	name,
	translation,
}: {
	type: string
	name: ReactNode
	translation?: string
}) {
	return (
		<div className="elementDetailHeader">
			<span className="elementDetailType">{type}</span>
			<span className="elementDetailName">{name}</span>
			{translation && (
				<span className="elementDetailTranslation">{translation}</span>
			)}
		</div>
	)
}

function DetailConstruction({
	label,
	body,
	examples,
}: {
	label: string
	body: string
	examples: any[]
}) {
	return (
		<div className="elementDetailConstruction">
			<div className="elementDetailConstructionFormula">
				<span className="elementDetailConstructionLabel">{label}:</span>{" "}
				{body}
			</div>
			<div className="elementDetailExamples">
				{examples.map((example: any) => (
					<div key={getExampleKey(example)}>
						<ExampleText example={example} />
					</div>
				))}
			</div>
		</div>
	)
}

function ExampleText({ example }: { example: any }) {
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

	return <>{String(example)}</>
}

function ConjugationExample({ base, conjugation }: { base?: string; conjugation: string }) {
	if (!base) return <>{conjugation}</>

	const stemLength = getSharedPrefixLength(base, conjugation)
	return (
		<>
			<ConjugationExampleWord text={base} stemLength={stemLength} />
			{" → "}
			<ConjugationExampleWord text={conjugation} stemLength={stemLength} />
		</>
	)
}

function ConjugationExampleWord({ text, stemLength }: { text: string; stemLength: number }) {
	const characters = Array.from(text)
	const stem = characters.slice(0, stemLength).join("")
	const ending = characters.slice(stemLength).join("")

	if (!ending) return <>{text}</>

	return (
		<>
			{stem}
			<strong className="elementDetailConjugationEnding">{ending}</strong>
		</>
	)
}

function getExampleKey(example: any) {
	if (isConjugationExample(example)) {
		return [example.base, example.conjugation].filter(Boolean).join(" → ")
	}

	return String(example)
}

function isConjugationExample(example: any) {
	return Boolean(
		example &&
			typeof example === "object" &&
			typeof example.conjugation === "string",
	)
}

function parseTranslationExample(text: string) {
	const [japanese, english, extra] = text.split(/\s*=>\s*/)
	if (!japanese || !english || extra !== undefined) return null

	return {
		japanese,
		english,
	}
}

function getSharedPrefixLength(base: string, conjugation: string) {
	const baseCharacters = Array.from(base)
	const conjugationCharacters = Array.from(conjugation)
	const shortestLength = Math.min(baseCharacters.length, conjugationCharacters.length)

	for (let index = 0; index < shortestLength; index += 1) {
		if (baseCharacters[index] !== conjugationCharacters[index]) return index
	}

	return shortestLength
}

function getVocabularyDetail(element: any) {
	if (!element || !VOCABULARY_TYPES.has(element.elementType)) return null
	if (!element.text || !element.meanings?.length) return null

	const kana = element.textKana || element.text
	const romaji = toRomaji(kana)

	return {
		kind: "vocabulary",
		type: VOCABULARY_TYPE_LABELS[element.elementType] || element.elementType,
		word: element.text,
		kana,
		romaji,
		translations: element.meanings,
	}
}
