import { useState } from "react"
import "../App.css"

export default function Counter({ mouse, element, onClickSelf, updateElement, secondaryColor }) {
	const [number, setNumber] = useState(element.number || "0")

	function onChange(e) {
		setNumber(e.target.value)
		updateElement({
			...element,
			number: e.target.value,
		})
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
				onChange={onChange}
				placeholder="0"
			/>
			<div className="elementText" onClick={onClickSelf}>
				{element?.text}
			</div>
		</div>
	)
}
