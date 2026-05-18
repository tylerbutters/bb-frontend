import { useEffect, useState } from "react"
import Conjugation from "./Conjugation"
import AddElementModal from "../AddElementModal"

export default function Verb({ element, updateElement, deleteElement, mouse, elementOptions }) {
	const [isModalOpen, setIsModalOpen] = useState(false)

	useEffect(() => {
		initializeVerb(element)
	}, [])

	function initializeVerb(newElement) {
		updateElement({
			...newElement,
			conjugation: {
				stem: newElement?.ending,
			},
		})
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={elementOptions}
				onSelect={initializeVerb}
				deleteElement={deleteElement}
				hasDelete={true}
			/>
			<div className="baseElement verbElement">
				<div className="elementText" onClick={() => setIsModalOpen(true)}>
					{element.stem}
				</div>
				{element.conjugation && (
					<Conjugation
						parentConjugation={element}
						updateConjugation={updateElement}
						deleteElement={deleteElement}
						mouse={mouse}
					/>
				)}
			</div>
		</div>
	)
}
