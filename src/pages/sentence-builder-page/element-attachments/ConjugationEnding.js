import { useRef, useState } from "react"
import ElementsMenu from "../element-options-menu/ElementsMenu"
import "../elements/Element.css"
import { createConjugationFromData } from "../grammar/conjugationOptions"
import { conjugations } from "../grammar/conjugationData"

export function getConjugationEndingUpdate(conjugations, selectedConjugation) {
	const conjugationData = conjugations[selectedConjugation.text]
	if (!conjugationData) return {}

	return createConjugationFromData(conjugationData)
}

export function getConjugationEndingOptions(conjugations, conjugation) {
	return (
		conjugation?.conjugationOptions ||
		conjugations[`${conjugation?.stem || ""}${conjugation?.ending || ""}`]?.conjugationOptions ||
		[]
	)
}

export default function ConjugationEnding({ conjugation, updateConjugation, color }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef(null)
	const conjugationOptions = getConjugationEndingOptions(conjugations, conjugation)

	function onSelect(selectedConjugation) {
		updateConjugation(getConjugationEndingUpdate(conjugations, selectedConjugation))
	}

	return (
		<div className="modalContainer">
			<ElementsMenu
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
