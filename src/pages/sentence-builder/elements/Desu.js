import Conjugation from "../element-attachments/Conjugation"
import NoDesu from "../element-attachments/NoDesu"
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
}) {
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
						hasDelete={true}
						addButtonsDisabled={addButtonsDisabled}
						disabled={conjugationDisabled}
					/>
				)}
			</div>
		</div>
	)
}
