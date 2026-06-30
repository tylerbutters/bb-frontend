import "./Element.css"
import type { SentenceElement } from "../types"

export default function Punctuation({ element }: { element: SentenceElement }) {
	return (
		<div className="baseElement">
			<div className="elementText">{element.text}</div>
		</div>
	)
}
