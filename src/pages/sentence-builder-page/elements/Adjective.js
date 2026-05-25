import "./Element.css"
import Conjugation from "../element-attachments/Conjugation"
import JapaneseText from "../components/JapaneseText"

export default function Adjective({
	element,
	updateElement,
	mouse,
	deleteElement,
	allColors,
	addButtonsDisabled,
}) {
	return (
		<div className="modalContainer">
			<div className="baseElement">
				{element.conjugation && element.adjectiveType === "i-type" && (
					<>
						<div className="elementText">
							<JapaneseText text={element.stem} reading={element.stemKana} />
						</div>
						<Conjugation
							parentConjugation={element}
							updateConjugation={updateElement}
							deleteElement={deleteElement}
							mouse={mouse}
							color={allColors.adjective.secondary}
							allColors={allColors}
							addButtonsDisabled={addButtonsDisabled}
						/>
					</>
				)}
				{element.adjectiveType === "na-type" && (
					<>
						<div className="elementText">
							<JapaneseText text={element.text} reading={element.textKana} />
						</div>
					</>
				)}
			</div>
		</div>
	)
}
