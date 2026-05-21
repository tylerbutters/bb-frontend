import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import "./App.css"
import AddButton from "./components/AddButton"
import Element from "./elements/Element"
import useSentenceDragDrop from "./hooks/useSentenceDragDrop"
import SentenceText from "./SentenceText"
import adjectives from "./jmdict/processed/adjectives.json"
import adverbs from "./jmdict/processed/adverbs.json"
import counters from "./jmdict/processed/counters.json"
import nouns from "./jmdict/processed/nouns.json"
import verbs from "./jmdict/processed/verbs.json"
import useGrammarStore from "./store/useGrammarStore"

const SENTENCE_ELEMENTS_VIEWPORT_PADDING = 100

export default function App() {
	const nextElementId = useRef(0)
	const sentenceElementsContainerRef = useRef(null)
	const sentenceElementsScaleRef = useRef(1)
	const scaleFrameRef = useRef(null)
	const scaleTimeoutRef = useRef(null)
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [sentenceElementsScale, setSentenceElementsScale] = useState(1)
	const grammarStore = useGrammarStore((state) => state)
	const defaultElements = [
		{ text: "Nouns", list: nouns },
		{ text: "Verbs", list: verbs },
		{ text: "Adjectives", list: adjectives },
		{ text: "Adverbs", list: adverbs },
		{ text: "Counters", list: counters },
		{ text: "Punctuation", list: grammarStore.punctuation },
		{ text: "だ", list: [{ elementType: "desu", text: "だ", stem: "だ" }] },
	]
	const {
		dragState,
		getDragPreviewTransform,
		setElementDragNode,
		shouldSuppressElementClick,
		startElementPointerDrag,
	} = useSentenceDragDrop({
		elements: addedElements,
		setElements: setAddedElements,
		containerRef: sentenceElementsContainerRef,
		scale: sentenceElementsScale,
	})

	useEffect(() => {
		function handleMove(e) {
			setMouse({ x: e.clientX, y: e.clientY })
		}

		window.addEventListener("mousemove", handleMove)
		return () => window.removeEventListener("mousemove", handleMove)
	}, [])

	useLayoutEffect(() => {
		const container = sentenceElementsContainerRef.current
		if (!container) return

		function updateScale() {
			const availableWidth = Math.max(window.innerWidth - SENTENCE_ELEMENTS_VIEWPORT_PADDING * 2, 1)
			const contentWidth = Math.max(container.scrollWidth, 1)
			const nextScale = Math.min(1, availableWidth / contentWidth)

			if (Math.abs(sentenceElementsScaleRef.current - nextScale) < 0.005) return
			sentenceElementsScaleRef.current = nextScale
			setSentenceElementsScale(nextScale)
		}

		function scheduleScaleUpdate() {
			if (scaleFrameRef.current) {
				cancelAnimationFrame(scaleFrameRef.current)
			}

			scaleFrameRef.current = requestAnimationFrame(() => {
				scaleFrameRef.current = null
				updateScale()
			})
		}

		scheduleScaleUpdate()
		scaleTimeoutRef.current = window.setTimeout(scheduleScaleUpdate, 320)
		window.addEventListener("resize", scheduleScaleUpdate)

		return () => {
			if (scaleFrameRef.current) {
				cancelAnimationFrame(scaleFrameRef.current)
			}
			if (scaleTimeoutRef.current) {
				window.clearTimeout(scaleTimeoutRef.current)
			}
			window.removeEventListener("resize", scheduleScaleUpdate)
		}
	}, [addedElements])

	useEffect(() => {
		let pressedElement
		let hoveredElement

		function clearPressedElement() {
			pressedElement?.classList.remove("pressedElement")
			pressedElement = null
		}

		function clearHoveredElement() {
			hoveredElement?.classList.remove("hoverElement")
			hoveredElement = null
		}

		function handlePointerDown(e) {
			clearPressedElement()

			if (e.target.closest("input, button")) return

			pressedElement = e.target.closest(".baseInsideElement,.elementContainer,.addButton ")
			pressedElement?.classList.add("pressedElement")
		}

		function handlePointerOver(e) {
			//it would highlight the parent conjugation when hovering over menu
			if (e.target.closest(".elementOptionsMenuContainer")) return

			const element = e.target.closest(".baseInsideElement,.elementContainer,.addButton ")

			if (element === hoveredElement) return

			clearHoveredElement()

			if (element) {
				hoveredElement = element
				hoveredElement.classList.add("hoverElement")
			}
		}

		function handlePointerOut(e) {
			if (hoveredElement && !hoveredElement.contains(e.relatedTarget)) {
				clearHoveredElement()
			}
		}

		document.addEventListener("pointerdown", handlePointerDown)
		document.addEventListener("pointerup", clearPressedElement)
		document.addEventListener("pointercancel", clearPressedElement)

		document.addEventListener("pointerover", handlePointerOver)
		document.addEventListener("pointerout", handlePointerOut)

		return () => {
			clearPressedElement()
			clearHoveredElement()

			document.removeEventListener("pointerdown", handlePointerDown)
			document.removeEventListener("pointerup", clearPressedElement)
			document.removeEventListener("pointercancel", clearPressedElement)

			document.removeEventListener("pointerover", handlePointerOver)
			document.removeEventListener("pointerout", handlePointerOut)
		}
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
		setAddedElements((prev) => prev.filter((element) => element.sentenceElementId !== elementId))
	}

	return (
		<div className="app">
			<SentenceText addedElements={addedElements} />
			<div
				ref={sentenceElementsContainerRef}
				className={`sentenceElementsContainer ${dragState ? "sentenceElementsDragging" : ""}`}
				style={{ transform: `scale(${sentenceElementsScale})` }}
			>
				{addedElements.map((element, index) => {
					const isDraggingThis = dragState?.elementId === element.sentenceElementId
					const isDroppingThis = isDraggingThis && dragState?.isDropping
					const unscaledDragWidth = dragState?.width / sentenceElementsScale
					const unscaledDragHeight = dragState?.height / sentenceElementsScale
					return (
						<Fragment key={element.sentenceElementId}>
							<AddButton
								mouse={mouse}
								elementOptions={defaultElements}
								addElement={(selectedElement) => addElement(index, selectedElement)}
								text="word"
								disabled={Boolean(dragState)}
							/>
							<div
								ref={(node) => {
									setElementDragNode(element.sentenceElementId, node)
								}}
								className={`mainElementDragItem ${
									isDraggingThis ? "mainElementDragging" : ""
								} ${isDroppingThis ? "mainElementDropping" : ""}`}
								style={
									isDraggingThis
										? {
												width: unscaledDragWidth,
												height: unscaledDragHeight,
											}
										: {
												transform: getDragPreviewTransform(element.sentenceElementId, index),
											}
								}
								onPointerDown={(e) => startElementPointerDrag(e, element.sentenceElementId)}
								onClickCapture={(e) => {
									if (!shouldSuppressElementClick()) return
									e.preventDefault()
									e.stopPropagation()
								}}
							>
								<div
									className={`mainElementDragContent ${
										isDroppingThis ? "mainElementDragContentDropping" : ""
									}`}
									style={
										isDraggingThis
											? {
													position: "fixed",
													left: dragState.x,
													top: dragState.y,
													width: unscaledDragWidth,
													zIndex: 2000,
													pointerEvents: "none",
												}
											: undefined
									}
								>
									<Element
										element={element}
										mouse={mouse}
										addButtonsDisabled={Boolean(dragState)}
										updateElement={(newElement) =>
											updateElement(element.sentenceElementId, newElement)
										}
										deleteElement={() => deleteElement(element.sentenceElementId)}
										defaultElements={defaultElements}
									/>
								</div>
							</div>
							{index === addedElements.length - 1 && (
								<AddButton
									mouse={mouse}
									elementOptions={defaultElements}
									addElement={(element) => addElement(index + 1, element)}
									text="word"
									disabled={Boolean(dragState)}
								/>
							)}
						</Fragment>
					)
				})}
				{!addedElements.length && (
					<AddButton
						locked={true}
						mouse={mouse}
						elementOptions={defaultElements}
						addElement={(element) => addElement(0, element)}
						text="word"
						disabled={Boolean(dragState)}
					/>
				)}
			</div>
		</div>
	)
}
