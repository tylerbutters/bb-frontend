import { toRomaji } from "wanakana"
import JapaneseText from "../components/JapaneseText"
import { getConjugationDetail } from "../grammar/conjugationDetailsData"
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
			{detail.kind === "conjugation" && <ConjugationDetail detail={detail} />}
			{detail.kind === "vocabulary" && <VocabularyDetail detail={detail} />}
		</aside>
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
									<div key={example}>{example}</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
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
