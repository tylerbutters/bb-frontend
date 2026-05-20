import "../App.css"
import JapaneseText from "../components/JapaneseText"

export default function Adverb({ element }) {
	return (
		<div className="baseElement nounElement">
			<div className="elementText">
				<JapaneseText text={element?.text} reading={element?.textKana} />
			</div>
		</div>
	)
}
