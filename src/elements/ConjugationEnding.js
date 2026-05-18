import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"
import Verb from "./Verb"

export default function ConjugationEnding({ conjugation, updateConjugation }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const verbConjugations = useElementsStore((state) => state.conjugations.verbs)
	const [conjugationOptions, setConjugationOptions] = useState([])

	useEffect(() => {
		setConjugationOptions(getConjugationOptions())
	}, [])

	function onSelect(selectedConjugation) {
		updateConjugation({
			stem: verbConjugations[selectedConjugation.text]?.stem,
			ending: verbConjugations[selectedConjugation.text]?.ending,
		})
	}

	function getConjugationOptions() {
		return verbConjugations[`${conjugation?.stem}${conjugation?.ending}`]?.conjugationOptions || []
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions}
				onSelect={onSelect}
			/>
			<div className="baseInsideElement conjugationEnding" onClick={() => setIsModalOpen(true)}>
				<div className="insideElementText">{conjugation.ending}</div>
			</div>
		</div>
	)
}
