import { useState } from "react"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import "../App.css"
import useGrammarStore from "../store/useGrammarStore"

export default function Punctuation({ text, onClickSelf }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [lastChar, setLastChar] = useState(text.at(-1))
	const allElements = useGrammarStore((state) => state)
	const punctuation = { punctuation: allElements.punctuation }
	const stem = text.slice(0, -1)

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={punctuation}
				onSelect={(element) => setLastChar(element.text)}
			/>
			<div className="baseElement punctuationElement">
				<div className="elementText" onClick={onClickSelf}>
					{stem}
				</div>
				<div className="baseInsideElement punctuationLastChar" onClick={() => setIsModalOpen(true)}>
					{lastChar}
				</div>
			</div>
		</div>
	)
}
