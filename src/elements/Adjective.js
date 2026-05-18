import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"

export default function Adjective({ element, onClickSelf }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [lastChar, setLastChar] = useState(element.at(-1))
	const allElements = useElementsStore((state) => state)
	const adjectiveConjugations = { adjectiveConjugations: allElements.adjectiveConjugations }

	useEffect(() => {
		setLastChar(element.at(-1))
	}, [])

	const stem = element.slice(0, -1)
	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={adjectiveConjugations}
				onSelect={(element) => setLastChar(element.value)}
			/>
			<div className="baseElement adjectiveElement">
				<div className="elementText" onClick={onClickSelf}>
					{stem}
				</div>
				<div className="baseInsideElement adjectiveLastChar" onClick={() => setIsModalOpen(true)}>
					{lastChar}
				</div>
			</div>
		</div>
	)
}
