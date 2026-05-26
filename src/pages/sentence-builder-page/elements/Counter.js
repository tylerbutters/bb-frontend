import { useEffect, useState } from "react"
import InputBox from "../../../components/InputBox"
import "./Element.css"
import JapaneseText from "../components/JapaneseText"

export default function Counter({ mouse, element, updateElement, allColors }) {
	const [number, setNumber] = useState(element.number ?? "0")

	useEffect(() => {
		setNumber(element.number ?? "0")
	}, [element.number])

	function handleNumberChange(nextNumber) {
		if (!/^\d*$/.test(nextNumber)) return

		setNumber(nextNumber)
	}

	function handleKeyDown(e) {
		if (e.key !== "Enter") return

		updateElement({
			...element,
			number: e.currentTarget.value,
		})
		e.target.blur()
	}

	return (
		<div className="baseElement">
			<InputBox
				type="text"
				className="baseInsideElement counterInput"
				style={{
					backgroundColor: allColors.counter.secondary,
					width: `${Math.max(number.length + 1, 2)}ch`,
				}}
				value={number}
				onChange={handleNumberChange}
				onKeyDown={handleKeyDown}
				onFocus={(e) => e.target.select()}
				placeholder="0"
			/>
			<div className="elementText">
				<JapaneseText text={element?.text} reading={element?.textKana} />
			</div>
		</div>
	)
}
