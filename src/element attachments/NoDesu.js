import { useEffect, useState } from "react"
import "../App.css"
import ElementOptionsMenu from "../ElementOptionsMenu"
import useElementsStore from "../useElementsStore"
import AddButton from "../AddButton"

export default function NoDesu({ element, updateElement, deleteElement, mouse, color }) {
	const [isModalOpen, setIsModalOpen] = useState()
	const noDesuOptions = useElementsStore((state) => state.noDesu)

	// useEffect(() => {
	// 	alert(JSON.stringify(noDesuOptions))
	// }, [])

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={noDesuOptions}
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
					<div className="insideElementText">{element?.text || "nothing"}</div>
				</div>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={noDesuOptions}
					addElement={updateElement}
					hasSearch={true}
				/>
			)}
		</div>
	)
}
