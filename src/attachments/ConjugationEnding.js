import { useRef, useState } from "react"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import "../App.css"
import useGrammarStore from "../store/useGrammarStore"

export default function ConjugationEnding({ conjugation, updateConjugation, color }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef(null)
	const verbConjugations = useGrammarStore((state) => state.conjugations)
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
				anchorRef={elementRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions}
				onSelect={onSelect}
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
