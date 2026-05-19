import "../App.css"

export default function Adverb({ element, onClickSelf }) {
	return (
		<div className="baseElement nounElement">
			<div className="elementText" onClick={onClickSelf}>
				{element?.text}
			</div>
		</div>
	)
}
