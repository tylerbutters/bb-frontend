import { useRef, useState } from "react"
import ElementsMenu from "../element-options-menu/ElementsMenu"
import "../elements/Element.css"
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
			<ElementsMenu
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
					text="particle"
					disabled={disabled}
				/>
			)}
		</div>
	)
}
