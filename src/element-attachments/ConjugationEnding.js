import { useRef, useState } from "react"
import ElementOptionsMenu from "../elemention-options-menu/ElementOptionsMenu"
import "../elements/Elements.css"
import useGrammarStore from "../store/useGrammarStore"
import { createConjugationFromData } from "../grammar/conjugationOptions"

export function getConjugationEndingUpdate(conjugations, selectedConjugation) {
	const conjugationData = conjugations[selectedConjugation.text]
	if (!conjugationData) return {}

	return createConjugationFromData(conjugationData)
}

export default function ConjugationEnding({ conjugation, updateConjugation, color }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef(null)
	const verbConjugations = useGrammarStore((state) => state.conjugations)
	const conjugationOptions =
		verbConjugations[`${conjugation?.stem}${conjugation?.ending}`]?.conjugationOptions || []

	function onSelect(selectedConjugation) {
		updateConjugation(getConjugationEndingUpdate(verbConjugations, selectedConjugation))
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				anchorRef={elementRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions}
				onSelect={onSelect}
				menuTitle="Conjugation"
			/>
			<div
				ref={elementRef}
				className="baseInsideElement conjugationElement"
				style={{ backgroundColor: color }}
				onClick={() => setIsModalOpen(true)}
			>
				{conjugation.ending}
			</div>
		</div>
	)
}
