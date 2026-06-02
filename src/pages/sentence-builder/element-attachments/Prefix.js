import { useRef, useState } from "react"
import "../elements/Element.css"
import ElementsMenu from "../element-options-menu/ElementsMenu"
import prefixes from "../jmdict/processed/prefixes.json"
import AddButton from "../components/AddButton"
import JapaneseText from "../components/JapaneseText"

export default function Prefix({ element, updateElement, deleteElement, mouse, color, disabled }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const elementRef = useRef(null)
	const prefixOptions = prefixes

	return (
		<div className="modalContainer">
			{!disabled && (
				<ElementsMenu
					anchorRef={elementRef}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={prefixOptions}
					onSelect={updateElement}
					deleteElement={deleteElement}
					hasDelete={true}
					menuTitle="Prefix"
				/>
			)}
			{element ? (
				<div
					ref={elementRef}
					className={`baseInsideElement ${disabled ? "baseInsideElementLocked" : ""}`}
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
					elementOptions={prefixOptions}
					addElement={updateElement}
					hasSearch={true}
					text="prefix"
					disabled={disabled}
				/>
			)}
		</div>
	)
}
