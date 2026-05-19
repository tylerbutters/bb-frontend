import { useEffect, useState } from "react"
import "./App.css"
import AddButton from "./AddButton"
import Noun from "./elements/Noun"
import Adjective from "./elements/Adjective"
import Verb from "./elements/Verb"
import Particle from "./element attachments/Particle"
import useElementsStore from "./useElementsStore"
import Element from "./elements/Element"
import dictionary from "./jmdict/processed-jmdict.json"

export default function App() {
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [sentenceString, setSentenceString] = useState("")
	const allElements = useElementsStore((state) => state)
	const defaultElements = [
		{ text: "Nouns", list: dictionary.nouns },
		{ text: "Verbs", list: dictionary.verbs },
		{ text: "Adjectives", list: dictionary.adjectives },
		{ text: "Adverbs", list: dictionary.adverbs },
		{ text: "Counters", list: dictionary.counters },
		{ text: "だ", list: [{ elementType: "desu", text: "だ", stem: "だ" }] },
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
		let sentence = ""
		function adjective(element) {
			if (element?.stem) sentence += element.stem
			if (element.conjugation && Object.keys(element.conjugation).length > 0) {
				verb(element.conjugation)
			}
			sentence += element.particle?.text || ""
		}

		function verb(element) {
			if (!element) return

			sentence += element.stem || ""
			sentence += element.middleParticle?.text || ""
			if (element.conjugation && Object.keys(element.conjugation).length > 0) {
				verb(element.conjugation)
			} else {
				sentence += element.ending || ""
			}
			sentence += element.particle?.text || ""
		}

		function noun(element) {
			if (element.prefix) sentence += element.prefix.text
			if (element.text) sentence += element.text
			if (element.suffix) sentence += element.suffix.text
			if (element.particle) sentence += element.particle.text
		}

		function adverb(element) {
			if (element.text) sentence += element.text
			if (element.particle) sentence += element.particle.text
		}

		function desu(element) {
			if (element.noDesu) sentence += element.noDesu.text
			if (element.conjugation && Object.keys(element.conjugation).length > 0) {
				verb(element.conjugation)
			}
			sentence += element.particle?.text || ""
		}

		function counter(element) {
			// alert(JSON.stringify(element))
			sentence += element.number
			sentence += element.text
		}

		addedElements.forEach((element) => {
			switch (element?.elementType) {
				case "noun":
					return noun(element)
				case "adjective":
					return adjective(element)
				case "verb":
					return verb(element)
				case "adverb":
					return adverb(element)
				case "desu":
					return desu(element)
				case "counter":
					return counter(element)
			}
		})
		// alert(JSON.stringify(string))
		setSentenceString(sentence)
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
