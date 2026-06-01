import Conjugation from "../element-attachments/Conjugation"
import JapaneseText from "../components/JapaneseText"
import "./Element.css"

export default function Verb({
	element,
	updateElement,
	deleteElement,
	mouse,
	allColors,
	addButtonsDisabled,
	conjugationDisabled = addButtonsDisabled,
}) {
	const hasConjugation = element.conjugation && Object.keys(element.conjugation).length > 0
	const shouldRenderStem = !element.conjugation?.replacesParent

	return (
		<div className="baseElement">
			{shouldRenderStem && (
				<div className="elementText">
					<JapaneseText text={element.stem} reading={element.stemKana} />
				</div>
			)}
			{hasConjugation && (
				<Conjugation
					color={allColors.verb.secondary}
					allColors={allColors}
					parentConjugation={element}
					updateConjugation={updateElement}
					deleteElement={deleteElement}
					mouse={mouse}
					addButtonsDisabled={addButtonsDisabled}
					disabled={conjugationDisabled}
				/>
			)}
		</div>
	)
}
