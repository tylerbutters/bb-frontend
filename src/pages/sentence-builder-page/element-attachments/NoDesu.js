import { useRef, useState } from "react"
import "../elements/Element.css"
import ElementOptionsMenu from "../element-options-menu/ElementOptionsMenu"
import useGrammarStore from "../../../store/useGrammarStore"
import AddButton from "../components/AddButton"

export default function NoDesu({ element, updateElement, deleteElement, mouse, color, disabled }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const elementRef = useRef(null)
	const noDesuOptions = useGrammarStore((state) => state.noDesu)

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				anchorRef={elementRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={noDesuOptions}
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
					elementOptions={noDesuOptions}
					addElement={updateElement}
					text="no"
					disabled={disabled}
				/>
			)}
		</div>
	)
}
