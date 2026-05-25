import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import ElementOptionsMenu from "../elemention-options-menu/ElementOptionsMenu"
import "./Elements.css"
import useGrammarStore from "../../../store/useGrammarStore"
import Particle from "../element-attachments/Particle"
import AnimatedWidth from "./AnimatedWidth"
import {
	ELEMENT_TYPE_COLORS,
	getElementTypeColors,
	getElementTypeComponent,
} from "./elementTypes"

export default function Element({
	element,
	mouse,
	updateElement,
	deleteElement,
	defaultElements,
	addButtonsDisabled = false,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isClosing, setIsClosing] = useState(false)
	const elementContainerRef = useRef(null)
	const particles = useGrammarStore((state) => state.particles)
	const ElementComponent = getElementTypeComponent(element?.elementType)
	const elementColors = getElementTypeColors(element?.elementType)
	const particleOptions = useMemo(() => {
		const availableParticles = particles.filter((particle) =>
			particle.attachesTo.includes(element.elementType),
		)
		if (element.adjectiveType) {
			availableParticles.push(
				...particles.filter((particle) => particle.attachesTo.includes(element.adjectiveType)),
			)
		}
		return availableParticles?.map((particle) => ({ elementType: "particle", text: particle.text }))
	}, [element.adjectiveType, element.elementType, particles])

	useEffect(() => {
		setIsModalOpen(false)
		setIsClosing(false)
	}, [element.sentenceElementId, element.elementType])

	function getElementKey() {
		return [
			element.sentenceElementId,
			element.elementType,
			element.text,
			element.textKana,
			element.stem,
			element.ending,
		]
			.filter(Boolean)
			.join(":")
	}

	function updateBaseElement(newElement) {
		updateElement(
			newElement.sentenceElementId === element.sentenceElementId
				? newElement
				: {
						...newElement,
						sentenceElementId: element.sentenceElementId,
					},
		)
	}

	function addParticle(selectedElement) {
		updateElement({ ...element, particle: selectedElement })
	}

	function renderElement() {
		if (!ElementComponent) return null

		const props = {
			element,
			updateElement: updateBaseElement,
			deleteElement: () => setIsClosing(true),
			mouse,
			elementOptions: defaultElements,
			allColors: ELEMENT_TYPE_COLORS,
			addButtonsDisabled,
		}

		return <ElementComponent {...props} />
	}

	function openMenuFromElementContainer(e) {
		//doesn't open if child elements are clicked
		if (e.target.closest(".baseInsideElement, .addButton, input, button")) return
		setIsModalOpen(true)
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				anchorRef={elementContainerRef}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={defaultElements}
				onSelect={updateElement}
				deleteElement={() => setIsClosing(true)}
				hasDelete={true}
				menuTitle="Word"
			/>
			<AnimatedWidth
				measureKey={element}
				isClosing={isClosing}
				onCloseComplete={deleteElement}
			>
				<div
					ref={elementContainerRef}
					className="elementContainer"
					style={{
						backgroundColor: elementColors.primary,
						borderColor: isModalOpen && "white",
					}}
					onClick={openMenuFromElementContainer}
				>
					<Fragment key={getElementKey()}>{renderElement()}</Fragment>
					{(particleOptions.length > 0 || element.particle) && (
						<Particle
							element={element.particle}
							elementOptions={particleOptions}
							updateElement={addParticle}
							deleteElement={() =>
								updateElement({
									...element,
									particle: null,
								})
							}
							mouse={mouse}
							disabled={addButtonsDisabled}
						/>
					)}
				</div>
			</AnimatedWidth>
		</div>
	)
}
