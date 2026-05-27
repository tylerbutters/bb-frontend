import { useRef, useState } from "react"
import "../elements/Element.css"
import ElementOptionsMenu from "../element-options-menu/ElementOptionsMenu"
import AddButton from "../components/AddButton"
import { noDesu } from "../grammar/conjugationData"

export default function NoDesu({ element, updateElement, deleteElement, mouse, color, disabled }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const elementRef = useRef(null)

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				anchorRef={elementRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={noDesu}
				onSelect={updateElement}
				deleteElement={deleteElement}
				hasDelete={true}
				menuTitle="No"
			/>
			{element ? (
				<div
					ref={elementRef}
					className="baseInsideElement"
					style={{ backgroundColor: color }}
					onClick={() => setIsModalOpen(true)}
				>
					<div className="insideElementText">{element?.text || "nothing"}</div>
				</div>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={noDesu}
					addElement={updateElement}
					text="no"
					disabled={disabled}
				/>
			)}
		</div>
	)
}
