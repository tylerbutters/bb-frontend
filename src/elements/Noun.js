import { useEffect, useRef, useState } from "react"
import "../App.css"
import AddButton from "../AddButton"
import Particle from "./Particle"
import Suffix from "./Suffix"
import Prefix from "./Prefix"
import AddElementModal from "../AddElementModal"
import useElementsStore from "../useElementsStore"
import dictionary from "../jmdict/processed-jmdict.json"

export default function Noun({ mouse, element, onClickSelf, updateElement }) {
	const [prefix, setPrefix] = useState(null)
	const [suffix, setSuffix] = useState(null)
	const [isOpen, setIsOpen] = useState(false)
	const allElements = useElementsStore((state) => state)
	const prefixOptions = dictionary.prefixes
	const suffixOptions = dictionary.suffixes
	const [particleOptions, setParticleOptions] = useState([])

	useEffect(() => {
		const availableParticles = allElements.particles.filter((particle) =>
			particle.attachesTo.includes("noun"),
		)
		// alert(JSON.stringify(availableParticles.map((particle) => ({ text: particle.text }))))
		setParticleOptions(
			availableParticles.map((particle) => ({ elementType: "particle", text: particle.text })),
		)
	}, [])

	function addElement(selectedElement) {
		// alert(JSON.stringify(selectedElement))
		switch (selectedElement?.elementType) {
			case "prefix":
				updateElement({ ...element, prefix: selectedElement })
				return
			case "suffix":
				updateElement({ ...element, suffix: selectedElement })
				return
			case "particle":
				updateElement({ ...element, particle: selectedElement })
				return
		}
	}

	function deleteElement(elementType) {
		switch (elementType) {
			case "prefix":
				updateElement({ ...element, prefix: null })
				return
			case "suffix":
				updateElement({ ...element, suffix: null })
				return
			case "particle":
				updateElement({ ...element, particle: null })
				return
		}
	}

	return (
		<div className="baseElement nounElement">
			{element.prefix ? (
				<Prefix
					element={element.prefix}
					elementOptions={prefixOptions}
					updateElement={addElement}
					deleteElement={deleteElement}
				/>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={prefixOptions}
					addElement={addElement}
					hasSearch={true}
				/>
			)}
			<div className="elementText" onClick={onClickSelf}>
				{element?.text}
			</div>
			{element.suffix ? (
				<Suffix
					element={element.suffix}
					elementOptions={suffixOptions}
					updateElement={addElement}
					deleteElement={deleteElement}
				/>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={suffixOptions}
					addElement={addElement}
					hasSearch={true}
				/>
			)}
			{element.particle ? (
				<Particle
					element={element.particle}
					elementOptions={particleOptions}
					updateElement={addElement}
					deleteElement={deleteElement}
				/>
			) : (
				<AddButton
					mouse={mouse}
					elementOptions={particleOptions}
					addElement={addElement}
					hasSearch={true}
				/>
			)}
		</div>
	)
}
