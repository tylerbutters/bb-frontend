import { useState } from "react"
import "../App.css"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import dictionary from "../jmdict/processed-jmdict.json"
import AddButton from "../components/AddButton"
import JapaneseText from "../components/JapaneseText"

export default function Suffix({ element, updateElement, deleteElement, mouse, color, disabled }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const suffixOptions = dictionary.suffixes

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={suffixOptions}
				onSelect={updateElement}
				deleteElement={deleteElement}
				hasDelete={true}
			/>
			{element ? (
				<div
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
					disabled={disabled}
				/>
			)}
		</div>
	)
}
