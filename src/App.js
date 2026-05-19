import { useEffect, useState } from "react"
import "./App.css"
import AddButton from "./AddButton"
import Element from "./elements/Element"
import SentenceText from "./SentenceText"
import dictionary from "./jmdict/processed-jmdict.json"

export default function App() {
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const defaultElements = [
		{ text: "Nouns", list: dictionary.nouns },
		{ text: "Verbs", list: dictionary.verbs },
		{ text: "Adjectives", list: dictionary.adjectives },
		{ text: "Adverbs", list: dictionary.adverbs },
		{ text: "Counters", list: dictionary.counters },
		{ text: "だ", list: [{ elementType: "desu", text: "だ", stem: "だ" }] },
	]

	useEffect(() => {
		function handleMove(e) {
			setMouse({ x: e.clientX, y: e.clientY })
		}

		window.addEventListener("mousemove", handleMove)
		return () => window.removeEventListener("mousemove", handleMove)
	}, [])

	function addElement(index, selectedElement) {
		// alert(JSON.stringify(selectedElement))

		setAddedElements((prev) => {
			const copy = [...prev]
			copy.splice(index, 0, selectedElement)
			return copy
		})
	}
	function updateElement(index, newElement) {
		// alert(JSON.stringify(newElement))
		setAddedElements((prev) => {
			const copy = [...prev]
			copy[index] = newElement
			return copy
		})
	}

	function deleteElement(index) {
		// alert(JSON.stringify(index))
		setAddedElements((prev) => {
			const copy = [...prev]
			copy.splice(index, 1)
			return copy
		})
	}

	return (
		<div className="app">
			<SentenceText addedElements={addedElements} />
			<div className="sentenceElementsContainer">
				{addedElements.map((element, index) => (
					<>
						<AddButton
							mouse={mouse}
							elementOptions={defaultElements}
							addElement={(selectedElement) => addElement(index, selectedElement)}
						/>
						<Element
							element={element}
							mouse={mouse}
							updateElement={(newElement) => updateElement(index, newElement)}
							deleteElement={() => deleteElement(index)}
							defaultElements={defaultElements}
						/>
						{index === addedElements.length - 1 && (
							<AddButton
								mouse={mouse}
								elementOptions={defaultElements}
								addElement={(element) => addElement(index + 1, element)}
							/>
						)}
					</>
				))}
				{!addedElements.length && (
					<AddButton
						locked={true}
						mouse={mouse}
						elementOptions={defaultElements}
						addElement={(element) => addElement(0, element)}
					/>
				)}
			</div>
		</div>
	)
}
