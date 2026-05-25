import { useRef, useState } from "react"
import "../elements/Element.css"
import ElementOptionsMenu from "../element-options-menu/ElementOptionsMenu"
import suffixes from "../jmdict/processed/suffixes.json"
import AddButton from "../components/AddButton"
import JapaneseText from "../components/JapaneseText"

export default function Suffix({ element, updateElement, deleteElement, mouse, color, disabled }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const elementRef = useRef(null)
	const suffixOptions = suffixes

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				anchorRef={elementRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={suffixOptions}
				onSelect={updateElement}
				deleteElement={deleteElement}
				hasDelete={true}
				menuTitle="Suffix"
			/>
			{element ? (
				<div
					ref={elementRef}
					className="baseInsideElement suffixPrefixElement"
					style={{ backgroundColor: color }}
					onClick={() => setIsModalOpen(true)}
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
