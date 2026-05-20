import { useState } from "react"
import Conjugation from "../attachments/Conjugation"
import ElementOptionsMenu from "../components/ElementOptionsMenu"

export default function Verb({
	element,
	updateElement,
	deleteElement,
	mouse,
	elementOptions,
	secondaryColor,
	primaryColor,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const hasConjugation = element.conjugation && Object.keys(element.conjugation).length > 0

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
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={elementOptions}
				onSelect={initializeVerb}
				deleteElement={deleteElement}
				hasDelete={true}
			/>
			<div className="baseElement">
				<div className="elementText" onClick={() => setIsModalOpen(true)}>
					{element.stem}
				</div>
				{hasConjugation && (
					<Conjugation
						color={secondaryColor}
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
