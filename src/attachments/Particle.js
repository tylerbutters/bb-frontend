import { useRef, useState } from "react"
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
	const elementRef = useRef(null)

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				anchorRef={elementRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={elementOptions}
				onSelect={updateElement}
				deleteElement={deleteElement}
				hasDelete={true}
				menuTitle="Particle"
			/>
			{element ? (
				<div
					ref={elementRef}
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
					text="particle"
					disabled={disabled}
				/>
			)}
		</div>
	)
}
