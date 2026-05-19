import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"
import Conjugation from "../element attachments/Conjugation"

export default function Adjective({
	element,
	onClickSelf,
	updateElement,
	mouse,
	deleteElement,
	elementOptions,
	secondaryColor,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)

	useEffect(() => {
		// alert(JSON.stringify(element))
		initializeAdjective(element)
	}, [])

	// useEffect(() => {
	// 	alert(JSON.stringify(element))
	// }, [element])

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
	function addParticle(selectedElement) {
		updateElement({ ...element, particle: selectedElement })
	}
	return (
		<div className="modalContainer">
			<AddElementModal
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
