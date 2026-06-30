import Conjugation from "../element-attachments/Conjugation"
import NoDesu from "../element-attachments/NoDesu"
import type { ElementComponentProps, SentenceElement } from "../types"
import "./Element.css"

export default function Desu({
	element,
	updateElement,
	deleteElement,
	mouse,
	allColors,
	addButtonsDisabled,
	conjugationDisabled = addButtonsDisabled,
	affixesDisabled = addButtonsDisabled,
}: ElementComponentProps) {
	function addNoDesu(newElement: SentenceElement) {
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
					color={allColors.desu.secondary}
					disabled={affixesDisabled}
				/>
				{element.conjugation && (
					<Conjugation
						parentConjugation={element}
						updateConjugation={updateElement}
						deleteElement={deleteElement}
						mouse={mouse}
						color={allColors.desu.secondary}
						allColors={allColors}
						addButtonsDisabled={addButtonsDisabled}
						disabled={conjugationDisabled}
					/>
				)}
			</div>
		</div>
	)
}
