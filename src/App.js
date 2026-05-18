import { useEffect, useState } from "react"
import "./App.css"
import AddButton from "./AddButton"
import Noun from "./elements/Noun"
import Adjective from "./elements/Adjective"
import Verb from "./elements/Verb"
import Particle from "./elements/Particle"
import useElementsStore from "./useElementsStore"
import Element from "./elements/Element"
import dictionary from "./jmdict/processed-jmdict.json"

export default function App() {
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [sentenceString, setSentenceString] = useState("")
	const defaultElements = [
		{ text: "Nouns", list: dictionary.nouns },
		{ text: "Verbs", list: dictionary.verbs },
		{ text: "Adjectives", list: dictionary.adjectives },
		{ text: "Adverbs", list: dictionary.adverbs },
		{ text: "Counters", list: dictionary.counters },
		{ text: "だ", list: dictionary.desu },
	]

	useEffect(() => {
		elementsToString(addedElements)
	}, [addedElements])

	useEffect(() => {
		function handleMove(e) {
			setMouse({ x: e.clientX, y: e.clientY })
		}

		window.addEventListener("mousemove", handleMove)
		return () => window.removeEventListener("mousemove", handleMove)
	}, [])

	function elementsToString(addedElements) {
		let string = ""
		function adjective(element) {
			if (element?.value) string += element.value
			if (element?.conjugation?.type === "adjective") adjective(element.conjugation)
			else if (element?.conjugation?.type === "adjectiveConjugation") {
				string += element.conjugation.value
			}
		}

		function verb(node) {
			if (!node) return

			string += node.stem || ""

			if (node.conjugation && Object.keys(node.conjugation).length > 0) {
				verb(node.conjugation)
			} else {
				string += node.ending || ""
			}
		}

		function noun(element) {
			if (element.prefix) string += element.prefix
			if (element.value) string += element.value
			if (element.suffix) string += element.suffix
			if (element.particle) string += element.particle
		}

		addedElements.forEach((element) => {
			if (element?.type === "noun") noun(element)
			else if (element?.type === "adjective") adjective(element)
			else if (element?.type === "verb") verb(element)
		})
		// alert(JSON.stringify(string))
		setSentenceString(string)
	}

	function initializeElement(element) {
		switch (element.elementType) {
			case "verb":
				return {
					...element,
					conjugation: {
						stem: element.ending,
					},
				}
			default:
				return element
		}
	}

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
			<div
				style={{
					color: "white",
					display: "flex",
					position: "absolute",
					flexDirection: "row",
					marginBottom: 200,
					fontSize: 30,
				}}
			>
				{sentenceString}
			</div>
			{/* <div style={{ color: "white", display: "flex", flexDirection: "row", marginBottom: 20 }}>
				{addedElements.map((element, index) => (
					<div key={index}>{element.value}</div>
				))}
			</div> */}
			<div className="elementsContainer">
				{addedElements.map((element, index) => (
					<div key={index} style={{ display: "flex", alignItems: "center" }}>
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
					</div>
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
