import { useRef, useState } from "react"
import "../elements/Element.css"
import ElementsMenu from "../elements-menu/TypedElementsMenu"
import suffixes from "../jmdict/processed/suffixes.json"
import AddButton from "../components/AddButton"
import JapaneseText from "../components/JapaneseText"
import type { MenuOption, MousePosition } from "../types"

interface SuffixProps {
	element?: MenuOption | null
	updateElement: (element: MenuOption) => void
	deleteElement: () => void
	mouse: MousePosition
	color: string
	disabled?: boolean
}

export default function Suffix({ element, updateElement, deleteElement, mouse, color, disabled }: SuffixProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef<HTMLDivElement | null>(null)
	const suffixOptions = suffixes

	return (
		<div className="modalContainer">
			{!disabled && (
				<ElementsMenu
					anchorRef={elementRef}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={suffixOptions}
					onSelect={updateElement}
					deleteElement={deleteElement}
					hasDelete={true}
					menuTitle="Suffix"
				/>
			)}
			{element ? (
				<div
					ref={elementRef}
					className={`baseInsideElement suffixPrefixElement ${
						disabled ? "baseInsideElementLocked" : ""
					}`}
					style={{ backgroundColor: color }}
					onClick={() => {
						if (!disabled) setIsModalOpen(true)
					}}
				>
					<JapaneseText text={element.text} reading={element.textKana} />
				</div>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={suffixOptions}
					addElement={updateElement}
					hasSearch={true}
					text="suffix"
					disabled={disabled}
				/>
			)}
		</div>
	)
}
