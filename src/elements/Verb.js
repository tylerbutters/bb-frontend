import Conjugation from "../attachments/Conjugation"

export default function Verb({ element, updateElement, deleteElement, mouse, allColors }) {
	const hasConjugation = element.conjugation && Object.keys(element.conjugation).length > 0

	return (
		<div className="baseElement">
			<div className="elementText">{element.stem}</div>
			{hasConjugation && (
				<Conjugation
					color={allColors.verb.secondary}
					allColors={allColors}
					parentConjugation={element}
					updateConjugation={updateElement}
					deleteElement={deleteElement}
					mouse={mouse}
				/>
			)}
		</div>
	)
}
