import { useRef, useState } from "react"
import ElementsMenu from "../elements-menu/TypedElementsMenu"
import "../elements/Element.css"
import AddButton from "../components/AddButton"
import type { MenuOption, MousePosition } from "../types"

interface ParticleProps {
	element?: MenuOption | null
	elementOptions?: MenuOption[]
	updateElement: (element: MenuOption) => void
	deleteElement: () => void
	mouse: MousePosition
	disabled?: boolean
}

export default function Particle({
	element,
	elementOptions,
	updateElement,
	deleteElement,
	mouse,
	disabled,
}: ParticleProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef<HTMLDivElement | null>(null)

	return (
		<div className="modalContainer">
			{!disabled && (
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
			)}
			{element ? (
				<div
					ref={elementRef}
					className={`baseInsideElement particleElement ${
						disabled ? "baseInsideElementLocked" : ""
					}`}
					onClick={() => {
						if (!disabled) setIsModalOpen(true)
					}}
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
