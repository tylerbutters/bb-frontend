import { useState } from "react"
import "../App.css"

export default function Counter({ mouse, element, updateElement, allColors }) {
	const [number, setNumber] = useState(element.number || "0")

	function onChange(e) {
		setNumber(e.target.value)
	}

	function handleKeyDown(e) {
		if (e.key !== "Enter") return

		if (!/^\d*$/.test(e.target.value)) {
			alert("Only numbers")
			return
		}
		updateElement({
			...element,
			number,
		})

		e.target.blur()
	}

	return (
		<div className="baseElement">
			<input
				type="text"
				className="baseInsideElement counterInput"
				style={{
					backgroundColor: allColors.counter.secondary,
					width: `${Math.max(number.length + 1, 2)}ch`,
				}}
				value={number}
				onChange={onChange}
				onKeyDown={handleKeyDown}
				onFocus={(e) => e.target.select()}
				placeholder="0"
			/>
			<div className="elementText">{element?.text}</div>
		</div>
	)
}
