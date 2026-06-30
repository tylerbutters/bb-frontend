import type { CSSProperties, FocusEvent, KeyboardEvent } from "react"
import { useEffect, useState } from "react"
import InputBox from "../../../components/InputBox"
import "./Element.css"
import JapaneseText from "../components/JapaneseText"
import type { SentenceElement } from "../types"

interface CounterProps {
	element: SentenceElement
	updateElement: (element: SentenceElement) => void
	allColors: {
		counter: {
			secondary: string
		}
	}
	counterDisabled?: boolean
}

export default function Counter({ element, updateElement, allColors, counterDisabled = false }: CounterProps) {
	const [number, setNumber] = useState(String(element.number ?? "0"))

	useEffect(() => {
		setNumber(String(element.number ?? "0"))
	}, [element.number])

	function counterStyle(): CSSProperties {
		return {
			backgroundColor: allColors.counter.secondary,
			width: `${Math.max(number.length + 1, 2)}ch`,
		}
	}

	function handleNumberChange(nextNumber: string) {
		if (!/^\d*$/.test(nextNumber)) return

		setNumber(nextNumber)
	}

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key !== "Enter") return

		updateElement({
			...element,
			number: e.currentTarget.value,
		})
		e.currentTarget.blur()
	}

	return (
		<div className="baseElement">
			{counterDisabled ? (
				<div
					className="baseInsideElement counterInput counterInputLocked"
					style={counterStyle()}
				>
					{number}
				</div>
			) : (
				<InputBox
					type="text"
					className="baseInsideElement counterInput"
					style={counterStyle()}
					value={number}
					onChange={handleNumberChange}
					onKeyDown={handleKeyDown}
					onFocus={(e: FocusEvent<HTMLInputElement>) => e.currentTarget.select()}
					placeholder="0"
				/>
			)}
			<div className="elementText">
				<JapaneseText text={element?.text} reading={element?.textKana} />
			</div>
		</div>
	)
}
