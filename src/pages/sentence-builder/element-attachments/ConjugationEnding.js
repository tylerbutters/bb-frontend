import { useRef, useState } from "react"
import ElementsMenu from "../elements-menu/ElementsMenu"
import "../elements/Element.css"
import {
	createConjugationFromForm,
	getConjugationForm,
	getFollowUpConjugationOptions,
} from "../grammar/conjugationOptions"

export function getConjugationEndingUpdate(selectedConjugation) {
	const conjugationForm = getConjugationForm(selectedConjugation.text)
	if (!conjugationForm) return {}

	return createConjugationFromForm(conjugationForm)
}

export function getConjugationEndingOptions(conjugation) {
	return getFollowUpConjugationOptions(conjugation)
}

export default function ConjugationEnding({ conjugation, updateConjugation, color, disabled }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef(null)
	const conjugationOptions = getConjugationEndingOptions(conjugation)

	function onSelect(selectedConjugation) {
		if (disabled) return
		updateConjugation(getConjugationEndingUpdate(selectedConjugation))
	}

	return (
		<div className="modalContainer">
			{!disabled && (
				<ElementsMenu
					anchorRef={elementRef}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={conjugationOptions}
					onSelect={onSelect}
					menuTitle="Conjugation"
				/>
			)}
			<div
				ref={elementRef}
				className={`baseInsideElement conjugationElement ${
					disabled ? "baseInsideElementLocked" : ""
				}`}
				style={{ backgroundColor: color }}
				onClick={() => {
					if (!disabled) setIsModalOpen(true)
				}}
			>
				{conjugation.ending}
			</div>
		</div>
	)
}
