import Conjugation from "../attachments/Conjugation"
import NoDesu from "../attachments/NoDesu"

export default function Desu({ element, updateElement, deleteElement, mouse, secondaryColor }) {
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
