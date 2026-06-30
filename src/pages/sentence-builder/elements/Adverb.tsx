import "./Element.css"
import JapaneseText from "../components/JapaneseText"
import type { SentenceElement } from "../types"

export default function Adverb({ element }: { element: SentenceElement }) {
	return (
		<div className="baseElement nounElement">
			<div className="elementText">
				<JapaneseText text={element?.text} reading={element?.textKana} />
			</div>
		</div>
	)
}
