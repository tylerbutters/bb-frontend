import Conjugation from "../element-attachments/Conjugation"
import NoDesu from "../element-attachments/NoDesu"

export default function Desu({
	element,
	updateElement,
	deleteElement,
	mouse,
	allColors,
	addButtonsDisabled,
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
					disabled={addButtonsDisabled}
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
					/>
				)}
			</div>
		</div>
	)
}
