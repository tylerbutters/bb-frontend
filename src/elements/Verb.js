import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"

export default function Verb({ element, onClickSelf, replaceElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)

	useEffect(() => {
		if (!element.conjugation) {
			const stem = element?.value.slice(0, -1)
			replaceElement({ ...element, value: stem, conjugation: { type: "る", value: "る" } })
		}
		// alert(JSON.stringify(ichidanConjugations))
	}, [])

	function updateConjugation(newConjugation) {
		if (newConjugation.value === "られる") {
			newConjugation = { type: newConjugation.value, value: "られ", conjugation: { value: "る" } }
		} else if (newConjugation.value === "させる") {
			newConjugation = { type: newConjugation.value, value: "させ", conjugation: { value: "る" } }
		}
		replaceElement({ ...element, conjugation: newConjugation })
		// alert(JSON.stringify({ ...element, conjugation: newConjugation }))
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={allElements.ichidanConjugations.default || []}
				onSelect={updateConjugation}
			/>
			<div className="baseElement verbElement">
				<div className="elementText" onClick={onClickSelf}>
					{element?.value}
				</div>
				<div className="baseInsideElement verbLastChar">
					<div onClick={() => setIsModalOpen(true)}>{element?.conjugation?.value}</div>
					{element?.conjugation?.conjugation?.value && (
						<VerbConjugation
							element={element}
							onClickSelf={onClickSelf}
							replaceElement={replaceElement}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

function VerbConjugation({ element, onClickSelf, replaceElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)

	useEffect(() => {
		alert(JSON.stringify(element))
	}, [])

	function updateConjugation(newConjugation) {
		if (newConjugation.value === "られる") {
			newConjugation = { value: "られ", conjugation: { value: "る" } }
		} else if (newConjugation.value === "させる") {
			newConjugation = { value: "させ", conjugation: { value: "る" } }
		}
		replaceElement({
			...element,
			conjugation: { ...element.conjugation, conjugation: newConjugation },
		})
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={allElements.ichidanConjugations[element.conjugation.type] || []}
				onSelect={updateConjugation}
			/>
			<div className="baseInsideElement verbConj" onClick={() => setIsModalOpen(true)}>
				{element?.conjugation?.conjugation?.value}
				{element?.conjugation?.conjugation?.conjugation?.value && (
					<VerbConjugation2
						element={element}
						onClickSelf={onClickSelf}
						replaceElement={replaceElement}
					/>
				)}
			</div>
		</div>
	)
}

function VerbConjugation2({ element, onClickSelf, replaceElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)
	const godanConjugations = allElements.godanConjugations
	const ichidanConjugations = { ichidanConjugations: allElements.ichidanConjugations }
	const isIchidan = true

	function updateConjugation(newConjugation) {
		if (newConjugation.value === "られる") {
			newConjugation = { value: "られ", conjugation: { value: "る" } }
		} else if (newConjugation.value === "させる") {
			newConjugation = { value: "させ", conjugation: { value: "る" } }
		}
		replaceElement({
			...element,
			conjugation: {
				...element.conjugation,
				conjugation: { ...element.conjugation.conjugation, conjugation: newConjugation },
			},
		})
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={isIchidan ? ichidanConjugations : godanConjugations}
				onSelect={updateConjugation}
			/>
			<div
				className="baseInsideElement verbConj"
				style={{ backgroundColor: "green" }}
				onClick={() => setIsModalOpen(true)}
			>
				{element?.conjugation?.conjugation?.conjugation?.value}
			</div>
		</div>
	)
}
