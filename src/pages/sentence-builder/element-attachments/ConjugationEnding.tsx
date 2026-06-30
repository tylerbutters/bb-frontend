import { useRef, useState } from "react"
import ElementsMenu from "../elements-menu/ElementsMenu"
import "../elements/Element.css"
import {
	createConjugationFromForm,
	getConjugationForm,
	getFollowUpConjugationOptions,
} from "../grammar/conjugationOptions"
import type { ConjugationOption, MenuOption } from "../types"

interface ConjugationEndingProps {
	conjugation: ConjugationOption
	updateConjugation: (conjugation: ConjugationOption) => void
	color: string
	disabled?: boolean
}

export function getConjugationEndingUpdate(selectedConjugation: MenuOption) {
	const conjugationForm = getConjugationForm(selectedConjugation.text || "")
	if (!conjugationForm) return {}

	return createConjugationFromForm(conjugationForm)
}

export function getConjugationEndingOptions(conjugation: ConjugationOption) {
	return getFollowUpConjugationOptions(conjugation)
}

export default function ConjugationEnding({
	conjugation,
	updateConjugation,
	color,
	disabled,
}: ConjugationEndingProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef<HTMLDivElement | null>(null)
	const conjugationOptions = getConjugationEndingOptions(conjugation)

	function onSelect(selectedConjugation: MenuOption) {
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
