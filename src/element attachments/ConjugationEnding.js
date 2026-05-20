import { useState } from "react"
import ElementOptionsMenu from "../ElementOptionsMenu"
import "../App.css"
import useElementsStore from "../useElementsStore"

export default function ConjugationEnding({ conjugation, updateConjugation, color }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const verbConjugations = useElementsStore((state) => state.conjugations)
	const conjugationOptions =
		verbConjugations[`${conjugation?.stem}${conjugation?.ending}`]?.conjugationOptions || []

	function onSelect(selectedConjugation) {
		updateConjugation({
			stem: verbConjugations[selectedConjugation.text]?.stem,
			ending: verbConjugations[selectedConjugation.text]?.ending,
		})
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions}
				onSelect={onSelect}
			/>
			<div
				className="baseInsideElement"
				style={{ backgroundColor: color }}
				onClick={() => setIsModalOpen(true)}
			>
				{conjugation.ending}
			</div>
		</div>
	)
}
