import { useState } from "react"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import "../App.css"
import Conjugation from "../attachments/Conjugation"

export default function Adjective({
	element,
	updateElement,
	mouse,
	deleteElement,
	elementOptions,
	secondaryColor,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)

	function initializeAdjective(newElement) {
		if (newElement.elementType === "verb" || newElement.adjectiveType === "i-type") {
			updateElement({
				...newElement,
				conjugation: {
					stem: newElement?.ending,
				},
			})
		} else {
			updateElement(newElement)
		}
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={elementOptions}
				onSelect={initializeAdjective}
				deleteElement={deleteElement}
				hasDelete={true}
			/>
			<div className="baseElement">
				{element.conjugation && element.adjectiveType === "i-type" && (
					<>
						<div className="elementText" onClick={() => setIsModalOpen(true)}>
							{element.stem}
						</div>
						<Conjugation
							parentConjugation={element}
							updateConjugation={updateElement}
							deleteElement={deleteElement}
							mouse={mouse}
							color={secondaryColor}
						/>
					</>
				)}
				{element.adjectiveType === "na-type" && (
					<>
						<div className="elementText" onClick={() => setIsModalOpen(true)}>
							{element.text}
						</div>
					</>
				)}
			</div>
		</div>
	)
}
