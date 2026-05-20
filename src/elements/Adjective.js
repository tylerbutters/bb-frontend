import "../App.css"
import Conjugation from "../attachments/Conjugation"

export default function Adjective({
	element,
	updateElement,
	mouse,
	deleteElement,
	secondaryColor,
}) {
	return (
		<div className="modalContainer">
			<div className="baseElement">
				{element.conjugation && element.adjectiveType === "i-type" && (
					<>
						<div className="elementText">{element.stem}</div>
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
						<div className="elementText">{element.text}</div>
					</>
				)}
			</div>
		</div>
	)
}
