import "../App.css"

export default function Adverb({ element }) {
	return (
		<div className="baseElement nounElement">
			<div className="elementText">{element?.text}</div>
		</div>
	)
}
