import { useEffect, useRef, useState } from "react"
import "../App.css"
import AddButton from "../AddButton"
import Particle from "./Particle"
import SuffixPrefix from "./SuffixPrefix"
import AddElementModal from "../AddElementModal"
import useElementsStore from "../useElementsStore"

export default function Noun({ mouse, element, onClickSelf, replaceElement }) {
	const [prefix, setPrefix] = useState(null)
	const [suffix, setSuffix] = useState(null)
	const [particle, setParticle] = useState(null)
	const [isOpen, setIsOpen] = useState(false)
	const allElements = useElementsStore((state) => state)
	const prefixElements = {
		prefix: allElements.prefix,
	}
	const suffixElements = {
		suffix: allElements.suffix,
	}
	const particleElements = {
		particle: allElements.particle,
	}
	const defaultElements = {
		noun: allElements.noun,
		verb: allElements.verb,
		adjective: allElements.adjective,
	}

	function addElement(selectedElement) {
		switch (selectedElement.type) {
			case "prefix":
				replaceElement({ ...element, prefix: selectedElement.value.value })
				return
			case "suffix":
				replaceElement({ ...element, suffix: selectedElement.value.value })
				return
			case "particle":
				replaceElement({ ...element, particle: selectedElement.value.value })
				return
		}
	}

	return (
		<div className="baseElement nounElement">
			{element.prefix ? (
				<SuffixPrefix
					text={element.prefix}
					elements={prefixElements}
					replaceElement={(newElement) => addElement(newElement, "prefix")}
				/>
			) : (
				<AddButton
					mouse={mouse}
					elements={prefixElements}
					addElement={(newElement) => addElement(newElement, "suffix")}
				/>
			)}
			<div className="elementText" onClick={onClickSelf}>
				{element?.value}
			</div>
			{element.suffix ? (
				<SuffixPrefix
					text={element.suffix}
					elements={suffixElements}
					replaceElement={(newElement) => addElement(newElement, "suffix")}
				/>
			) : (
				<AddButton
					mouse={mouse}
					elements={suffixElements}
					addElement={(newElement) => addElement(newElement, "suffix")}
				/>
			)}
			{element.particle ? (
				<Particle
					text={element.particle}
					elements={particleElements}
					replaceElement={(newElement) => addElement(newElement, "particle")}
				/>
			) : (
				<AddButton
					mouse={mouse}
					elements={particleElements}
					addElement={(newElement) => addElement(newElement, "suffix")}
				/>
			)}
		</div>
	)
}
