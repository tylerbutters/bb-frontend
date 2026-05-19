import { useEffect, useState } from "react"
import "../App.css"
import AddButton from "../AddButton"
import Particle from "../element attachments/Particle"
import Suffix from "../element attachments/Suffix"
import Prefix from "../element attachments/Prefix"
import useElementsStore from "../useElementsStore"
import dictionary from "../jmdict/processed-jmdict.json"

export default function Counter({ mouse, element, onClickSelf, updateElement, secondaryColor }) {
	const [number, setNumber] = useState(0)
	const allElements = useElementsStore((state) => state)

	function addElement(selectedElement) {
		// alert(JSON.stringify(selectedElement))
		switch (selectedElement?.elementType) {
			case "prefix":
				updateElement({ ...element, prefix: selectedElement })
				return
			case "suffix":
				updateElement({ ...element, suffix: selectedElement })
				return
		}
	}

	return (
		<div className="baseElement">
			<input
				type="text"
				className="baseInsideElement counterInput"
				style={{
					backgroundColor: secondaryColor,
					width: `${Math.max(number.length + 1, 2)}ch`,
				}}
				value={number}
				onChange={(e) => setNumber(e.target.value)}
				placeholder="0"
			/>
			<div className="elementText" onClick={onClickSelf}>
				{element?.text}
			</div>
		</div>
	)
}
