import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import Adjective from "./Adjective"
import Noun from "./Noun"
import Verb from "./Verb"
import useElementsStore from "../useElementsStore"
import Coupla from "./Coupla"
import Punctuation from "./Punctuation"

export default function Element({ element, mouse, replaceElement, deleteElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)
	const [selectedElements, setSelectedElements] = useState()

	const defaultElements = {
		noun: allElements.noun,
		verb: allElements.verb,
		adjective: allElements.adjective,
	}

	useEffect(() => {
		if (selectedElements) {
			replaceElement(selectedElements)
			setSelectedElements(null)
		}
	}, [isModalOpen])

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={defaultElements}
				onSelect={setSelectedElements}
				deleteElement={deleteElement}
				isElement={true}
			/>
			{element?.type === "noun" && (
				<Noun
					element={element}
					mouse={mouse}
					defaultElements={defaultElements}
					onClickSelf={() => setIsModalOpen(true)}
					replaceElement={replaceElement}
				/>
			)}
			{element?.type === "adjective" && (
				<Adjective
					element={element}
					mouse={mouse}
					onClickSelf={() => setIsModalOpen(true)}
					replaceElement={replaceElement}
				/>
			)}
			{element?.type === "verb" && (
				<Verb
					element={element}
					mouse={mouse}
					onClickSelf={() => setIsModalOpen(true)}
					replaceElement={replaceElement}
				/>
			)}
			{element?.type === "coupla" && (
				<Coupla
					element={element}
					mouse={mouse}
					onClickSelf={() => setIsModalOpen(true)}
					replaceElement={replaceElement}
				/>
			)}
			{element?.type === "punctuation" && (
				<Punctuation
					element={element}
					mouse={mouse}
					onClickSelf={() => setIsModalOpen(true)}
					replaceElement={replaceElement}
				/>
			)}
		</div>
	)
}
