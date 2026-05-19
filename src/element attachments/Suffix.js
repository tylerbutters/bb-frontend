import { useState } from "react"
import "../App.css"
import ElementOptionsMenu from "../ElementOptionsMenu"
import dictionary from "../jmdict/processed-jmdict.json"
import AddButton from "../AddButton"

export default function Suffix({ element, updateElement, deleteElement, mouse, color }) {
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
					{element.text}
				</div>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={suffixOptions}
					addElement={updateElement}
					hasSearch={true}
				/>
			)}
		</div>
	)
}
