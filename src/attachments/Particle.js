import { useState } from "react"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import "../App.css"
import AddButton from "../components/AddButton"

export default function Particle({
	element,
	elementOptions,
	updateElement,
	deleteElement,
	mouse,
	disabled,
}) {
	const [isModalOpen, setIsModalOpen] = useState()

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={elementOptions}
				onSelect={updateElement}
				deleteElement={deleteElement}
				hasDelete={true}
			/>
			{element ? (
				<div
					className="baseInsideElement particleElement"
					onClick={() => setIsModalOpen(true)}
				>
					{element.text}
				</div>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={elementOptions}
					addElement={updateElement}
					hasSearch={true}
					disabled={disabled}
				/>
			)}
		</div>
	)
}
