import { Fragment, useEffect, useRef, useState } from "react"
import "./App.css"
import AddButton from "./AddButton"
import Element from "./elements/Element"
import SentenceText from "./SentenceText"
import dictionary from "./jmdict/processed-jmdict.json"

export default function App() {
	const nextElementId = useRef(0)
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

	function normalizeElement(element) {
		if (element.elementType === "verb" && !element.conjugation) {
			return {
				...element,
				conjugation: {
					stem: element?.ending,
				},
			}
		}

		if (
			element.elementType === "adjective" &&
			element.adjectiveType === "i-type" &&
			!element.conjugation
		) {
			return {
				...element,
				conjugation: {
					stem: element?.ending,
				},
			}
		}

		if (element.elementType === "desu" && !element.conjugation) {
			return {
				...element,
				conjugation: {
					stem: element?.stem,
				},
			}
		}

		if (element.elementType === "counter" && element.number == null) {
			return {
				...element,
				number: "0",
			}
		}

		return element
	}

	function createSentenceElement(selectedElement) {
		return {
			...normalizeElement(selectedElement),
			sentenceElementId: nextElementId.current++,
		}
	}

	function addElement(index, selectedElement) {
		setAddedElements((prev) => {
			const copy = [...prev]
			copy.splice(index, 0, createSentenceElement(selectedElement))
			return copy
		})
	}

	function updateElement(elementId, newElement) {
		setAddedElements((prev) => {
			return prev.map((element) => {
				if (element.sentenceElementId !== elementId) return element

				return {
					...normalizeElement(newElement),
					sentenceElementId: elementId,
				}
			})
		})
	}

	function deleteElement(elementId) {
		setAddedElements((prev) =>
			prev.filter((element) => element.sentenceElementId !== elementId),
		)
	}

	return (
		<div className="app">
			<SentenceText addedElements={addedElements} />
			<div className="sentenceElementsContainer">
				{addedElements.map((element, index) => (
					<Fragment key={element.sentenceElementId}>
						<AddButton
							mouse={mouse}
							elementOptions={defaultElements}
							addElement={(selectedElement) => addElement(index, selectedElement)}
						/>
						<Element
							element={element}
							mouse={mouse}
							updateElement={(newElement) =>
								updateElement(element.sentenceElementId, newElement)
							}
							deleteElement={() => deleteElement(element.sentenceElementId)}
							defaultElements={defaultElements}
						/>
						{index === addedElements.length - 1 && (
							<AddButton
								mouse={mouse}
								elementOptions={defaultElements}
								addElement={(element) => addElement(index + 1, element)}
							/>
						)}
					</Fragment>
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
