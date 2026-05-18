import { useState } from "react"
import "../App.css"
import AddButton from "../AddButton"
import AddElementModal from "../AddElementModal"

export default function Prefix({ element, elementOptions, updateElement, deleteElement }) {
	const [isModalOpen, setIsModalOpen] = useState()

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={elementOptions}
				onSelect={updateElement}
				deleteElement={() => deleteElement(element.elementType)}
				isElement={true}
			/>
			<div className="baseInsideElement suffixPrefixElement" onClick={() => setIsModalOpen(true)}>
				<div className="insideElementText">{element.text}</div>
			</div>
		</div>
	)
}
