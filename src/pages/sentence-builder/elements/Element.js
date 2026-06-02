import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import ElementsMenu from "../element-options-menu/ElementsMenu"
import "./Element.css"
import Particle from "../element-attachments/Particle"
import AnimatedWidth from "./AnimatedWidth"
import { ELEMENT_TYPE_COLORS, getElementTypeColors, getElementTypeComponent } from "./elementTypes"
import { particles } from "../grammar/particleData"

export default function Element({
	element,
	mouse,
	updateElement,
	deleteElement,
	defaultElements,
	addButtonsDisabled = false,
	generatedElementMode,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isClosing, setIsClosing] = useState(false)
	const elementContainerRef = useRef(null)
	const ElementComponent = getElementTypeComponent(element?.elementType)
	const elementColors = getElementTypeColors(element?.elementType)
	const isGeneratedPromptElement = Boolean(element?.isGeneratedPromptElement)
	const canEditBaseElement =
		!isGeneratedPromptElement || generatedElementMode === "fix sentence"
	const canEditParticle =
		!isGeneratedPromptElement ||
		generatedElementMode === "particles" ||
		generatedElementMode === "fix sentence"
	const canEditConjugation =
		!isGeneratedPromptElement || generatedElementMode === "conjugations"
	const canEditAffixes = !isGeneratedPromptElement
	const canEditCounter = !isGeneratedPromptElement
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
	}, [element.adjectiveType, element.elementType])

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
		const nextElement =
			newElement.sentenceElementId === element.sentenceElementId
				? newElement
				: {
						...newElement,
						sentenceElementId: element.sentenceElementId,
					}

		updateElement({
			...nextElement,
			...(isGeneratedPromptElement ? { isGeneratedPromptElement: true } : {}),
		})
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
			affixesDisabled: addButtonsDisabled || !canEditAffixes,
			conjugationDisabled: addButtonsDisabled || !canEditConjugation,
			counterDisabled: addButtonsDisabled || !canEditCounter,
		}

		return <ElementComponent {...props} />
	}

	function openMenuFromElementContainer(e) {
		if (!canEditBaseElement) return
		//doesn't open if child elements are clicked
		if (e.target.closest(".baseInsideElement, .addButton, input, button")) return
		setIsModalOpen(true)
	}

	return (
		<div className="modalContainer">
			{canEditBaseElement && (
				<ElementsMenu
					anchorRef={elementContainerRef}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={defaultElements}
					onSelect={updateBaseElement}
					deleteElement={() => setIsClosing(true)}
					hasDelete={!isGeneratedPromptElement}
					menuTitle="Word"
				/>
			)}
			<AnimatedWidth measureKey={element} isClosing={isClosing} onCloseComplete={deleteElement}>
				<div
					ref={elementContainerRef}
					className={`elementContainer ${
						canEditBaseElement ? "" : "elementContainerLocked"
					}`}
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
							disabled={addButtonsDisabled || !canEditParticle}
						/>
					)}
				</div>
			</AnimatedWidth>
		</div>
	)
}
