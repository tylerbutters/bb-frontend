import { useEffect, useState } from "react"
import Conjugation from "../element attachments/Conjugation"
import ElementOptionsMenu from "../ElementOptionsMenu"

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
				{element.conjugation?.stem && (
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
