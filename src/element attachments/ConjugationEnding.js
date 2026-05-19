import { useEffect, useState } from "react"
import ElementOptionsMenu from "../ElementOptionsMenu"
import "../App.css"
import useElementsStore from "../useElementsStore"
import Verb from "../elements/Verb"

export default function ConjugationEnding({ conjugation, updateConjugation, color }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const verbConjugations = useElementsStore((state) => state.conjugations)
	const [conjugationOptions, setConjugationOptions] = useState([])

	useEffect(() => {
		getConjugationOptions()
	}, [])

	function onSelect(selectedConjugation) {
		updateConjugation({
			stem: verbConjugations[selectedConjugation.text]?.stem,
			ending: verbConjugations[selectedConjugation.text]?.ending,
		})
	}

	function getConjugationOptions() {
		setConjugationOptions(
			verbConjugations[`${conjugation?.stem}${conjugation?.ending}`]?.conjugationOptions || [],
		)
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
