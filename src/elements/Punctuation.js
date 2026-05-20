import "../App.css"

export default function Punctuation({ element }) {
	return (
		<div className="baseElement">
			<div className="elementText">{element.text}</div>
		</div>
	)
}
