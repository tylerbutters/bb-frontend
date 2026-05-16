import { useEffect, useState } from "react"
import "./App.css"
import AddButton from "./AddButton"
import Noun from "./elements/Noun"
import Adjective from "./elements/Adjective"
import Verb from "./elements/Verb"
import Particle from "./elements/Particle"
import useElementsStore from "./useElementsStore"
import Element from "./elements/Element"
import verbDictionary from "./verbs.json"

export default function App() {
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([
		// {
		// 	type: "verb",
		// 	characters: "食べ",
		// 	next: {
		// 			characters: "させ",
		// 			ending: "る",
		// 			next: {
		// 				characters: "られ",
		// 				ending: "る",
		// 				next: {
		// 					characters: "た",
		// 					ending: "い",
		// 					next: {
		// 						characters: "くな",
		// 						ending: "い",
		// 						next: {
		// 							characters: "かった",
		// 							ending: null,
		// 							next: {},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// },
	])
	const [sentenceString, setSentenceString] = useState("")
	const allElements = useElementsStore((state) => state)
	const defaultElements = {
		noun: allElements.noun,
		verbs: verbDictionary,
		adjective: allElements.adjective,
		punctuation: allElements.punctuation,
		coupla: allElements.coupla,
	}

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

			if (node.next && Object.keys(node.next).length > 0) {
				verb(node.next)
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
		switch (element.value.type) {
			case "noun":
				return {
					...element.value,
				}
			case "verb":
				// alert(
				// 	JSON.stringify({
				// 		...element.value,
				// 		next: {
				// 			stem: element.value.ending,
				// 			ending: null,
				// 			next: {},
				// 		},
				// 	}),
				// )
				if (element.value.verbType === "godan") {
					return {
						...element.value,
						next: {},
					}
				} else {
					return {
						...element.value,
						next: {
							stem: element.value.ending,
							ending: null,
							next: {},
						},
					}
				}
			default:
			// alert(JSON.stringify(element))
		}
	}

	function addElement(index, selectedElement) {
		// alert(JSON.stringify(selectedElement))

		setAddedElements((prev) => {
			const copy = [...prev]
			copy.splice(index, 0, initializeElement(selectedElement))
			return copy
		})
	}
	function replaceElement(index, newElement) {
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
							elements={defaultElements}
							addElement={(selectedElement) => addElement(index, selectedElement)}
						/>
						<Element
							element={element}
							mouse={mouse}
							replaceElement={(newElement) => replaceElement(index, newElement)}
							deleteElement={() => deleteElement(index)}
						/>
						{index === addedElements.length - 1 && (
							<AddButton
								mouse={mouse}
								elements={defaultElements}
								addElement={(element) => addElement(index + 1, element)}
							/>
						)}
					</div>
				))}
				{!addedElements.length && (
					<AddButton
						locked={true}
						mouse={mouse}
						elements={defaultElements}
						addElement={(element) => addElement(0, element)}
					/>
				)}
			</div>
		</div>
	)
}
