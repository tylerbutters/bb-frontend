import { useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"

export default function Particle({ element, elementOptions, updateElement, deleteElement }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const allElements = useElementsStore((state) => state)

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
			<div className="baseInsideElement particleElement" onClick={() => setIsModalOpen(true)}>
				<div className="insideElementText">{element.text}</div>
			</div>
		</div>
	)
}
