import { useState } from "react"
import "../App.css"
import ElementOptionsMenu from "../ElementOptionsMenu"
import dictionary from "../jmdict/processed-jmdict.json"
import AddButton from "../AddButton"

export default function Prefix({ element, updateElement, deleteElement, mouse, color }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const prefixOptions = dictionary.prefixes

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={prefixOptions}
				onSelect={updateElement}
				deleteElement={deleteElement}
				hasDelete={true}
			/>
			{element ? (
				<div
					className="baseInsideElement"
					style={{ backgroundColor: color }}
					onClick={() => setIsModalOpen(true)}
				>
					{element.text}
				</div>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={prefixOptions}
					addElement={updateElement}
					hasSearch={true}
				/>
			)}
		</div>
	)
}
