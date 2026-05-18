import { useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"

export default function Coupla({ text, onClickSelf }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [lastChar, setLastChar] = useState(text.at(-1))
	const allElements = useElementsStore((state) => state)
	const coupla = { coupla: allElements.coupla }
	const stem = text.slice(0, -1)

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={coupla}
				onSelect={(element) => setLastChar(element.text)}
			/>
			<div className="baseElement couplaElement">
				<div className="elementText" onClick={onClickSelf}>
					{stem}
				</div>
				<div className="baseInsideElement couplaLastChar" onClick={() => setIsModalOpen(true)}>
					{lastChar}
				</div>
			</div>
		</div>
	)
}
