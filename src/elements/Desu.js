import { useEffect } from "react"
import Conjugation from "../element attachments/Conjugation"
import NoDesu from "../element attachments/NoDesu"

export default function Desu({ element, updateElement, deleteElement, mouse, secondaryColor }) {
	useEffect(() => {
		initializeVerb(element)
	}, [])

	function initializeVerb(newElement) {
		updateElement({
			...newElement,
			conjugation: {
				stem: newElement?.stem,
			},
		})
	}

	function addNoDesu(newElement) {
		updateElement({
			...element,
			noDesu: newElement,
		})
	}

	return (
		<div className="modalContainer">
			<div className="baseElement verbElement">
				<NoDesu
					element={element.noDesu}
					updateElement={addNoDesu}
					deleteElement={() => updateElement({ ...element, noDesu: null })}
					mouse={mouse}
					color={secondaryColor}
				/>
				{element.conjugation && (
					<Conjugation
						parentConjugation={element}
						updateConjugation={updateElement}
						deleteElement={deleteElement}
						mouse={mouse}
						color={secondaryColor}
						hasDelete={true}
					/>
				)}
			</div>
		</div>
	)
}
