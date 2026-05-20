import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import "./App.css"
import AddButton from "./components/AddButton"
import Element from "./elements/Element"
import SentenceText from "./SentenceText"
import dictionary from "./jmdict/processed-jmdict.json"
import useGrammarStore from "./store/useGrammarStore"

export default function App() {
	const nextElementId = useRef(0)
	const elementDragRefs = useRef(new Map())
	const dragStartRef = useRef(null)
	const dragPreviewRef = useRef(null)
	const isDraggingElement = useRef(false)
	const suppressElementClick = useRef(false)
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [dragState, setDragState] = useState(null)
	const grammarStore = useGrammarStore((state) => state)
	const defaultElements = [
		{ text: "Nouns", list: dictionary.nouns },
		{ text: "Verbs", list: dictionary.verbs },
		{ text: "Adjectives", list: dictionary.adjectives },
		{ text: "Adverbs", list: dictionary.adverbs },
		{ text: "Counters", list: dictionary.counters },
		{ text: "Punctuation", list: grammarStore.punctuation },
		{ text: "だ", list: [{ elementType: "desu", text: "だ", stem: "だ" }] },
	]

	useEffect(() => {
		function handleMove(e) {
			setMouse({ x: e.clientX, y: e.clientY })
		}

		window.addEventListener("mousemove", handleMove)
		return () => window.removeEventListener("mousemove", handleMove)
	}, [])

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

	const moveElementToIndex = useCallback((draggedId, insertIndex) => {
		setAddedElements((prev) => {
			const draggedIndex = prev.findIndex((element) => element.sentenceElementId === draggedId)
			if (draggedIndex === -1) return prev

			const nextElements = [...prev]
			const [draggedElement] = nextElements.splice(draggedIndex, 1)
			const boundedIndex = Math.max(0, Math.min(insertIndex, nextElements.length))

			nextElements.splice(boundedIndex, 0, draggedElement)
			const didOrderChange = nextElements.some(
				(element, index) => element.sentenceElementId !== prev[index].sentenceElementId,
			)
			if (!didOrderChange) return prev

			return nextElements
		})
	}, [])

	const getDragInsertIndex = useCallback((pointerX, draggedId) => {
		const orderedRects = addedElements
			.filter((element) => element.sentenceElementId !== draggedId)
			.map((element) => {
				const node = elementDragRefs.current.get(element.sentenceElementId)
				return node
					? {
							elementId: element.sentenceElementId,
							centerX: node.getBoundingClientRect().left + node.getBoundingClientRect().width / 2,
						}
					: null
			})
			.filter(Boolean)

		const targetIndex = orderedRects.findIndex((rect) => pointerX < rect.centerX)
		return targetIndex === -1 ? orderedRects.length : targetIndex
	}, [addedElements])

	function startElementPointerDrag(e, elementId) {
		if (e.target.closest(".baseInsideElement, .addButton, input, button, .elementOptionsMenuContainer")) {
			return
		}

		e.preventDefault()
		const rect = e.currentTarget.getBoundingClientRect()
		dragStartRef.current = {
			elementId,
			pointerId: e.pointerId,
			originalIndex: addedElements.findIndex(
				(element) => element.sentenceElementId === elementId,
			),
			startX: e.clientX,
			startY: e.clientY,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			width: rect.width,
			height: rect.height,
		}
	}

	function getDragPreviewTransform(elementId, index) {
		if (!dragState || dragState.elementId === elementId) return undefined

		const { originalIndex, insertIndex, width } = dragState
		if (insertIndex > originalIndex && index > originalIndex && index <= insertIndex) {
			return `translateX(-${width}px)`
		}

		if (insertIndex < originalIndex && index >= insertIndex && index < originalIndex) {
			return `translateX(${width}px)`
		}

		return undefined
	}

	useEffect(() => {
		function moveDraggedElement(e) {
			const dragStart = dragStartRef.current
			if (!dragStart) return

			const deltaX = e.clientX - dragStart.startX
			const deltaY = e.clientY - dragStart.startY
			const hasStartedDragging = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4

			if (!dragState && !hasStartedDragging) return
			isDraggingElement.current = true
			const insertIndex = getDragInsertIndex(e.clientX, dragStart.elementId)
			dragPreviewRef.current = {
				elementId: dragStart.elementId,
				insertIndex,
				width: dragStart.width,
			}

			setDragState({
				elementId: dragStart.elementId,
				originalIndex: dragStart.originalIndex,
				insertIndex,
				x: e.clientX - dragStart.offsetX,
				y: e.clientY - dragStart.offsetY,
				width: dragStart.width,
				height: dragStart.height,
			})
		}

		function finishDraggedElement() {
			const dragPreview = dragPreviewRef.current
			if (dragPreview) {
				moveElementToIndex(dragPreview.elementId, dragPreview.insertIndex)
			}

			if (isDraggingElement.current) {
				suppressElementClick.current = true
				window.setTimeout(() => {
					suppressElementClick.current = false
				}, 0)
			}

			isDraggingElement.current = false
			dragPreviewRef.current = null
			dragStartRef.current = null
			setDragState(null)
		}

		window.addEventListener("pointermove", moveDraggedElement)
		window.addEventListener("pointerup", finishDraggedElement)
		window.addEventListener("pointercancel", finishDraggedElement)

		return () => {
			window.removeEventListener("pointermove", moveDraggedElement)
			window.removeEventListener("pointerup", finishDraggedElement)
			window.removeEventListener("pointercancel", finishDraggedElement)
		}
	}, [dragState, getDragInsertIndex, moveElementToIndex])

	return (
		<div className="app">
			<SentenceText addedElements={addedElements} />
			<div
				className={`sentenceElementsContainer ${
					dragState ? "sentenceElementsDragging" : ""
				}`}
			>
				{addedElements.map((element, index) => (
					<Fragment key={element.sentenceElementId}>
						<AddButton
							mouse={mouse}
							elementOptions={defaultElements}
							addElement={(selectedElement) => addElement(index, selectedElement)}
							disabled={Boolean(dragState)}
						/>
						<div
							ref={(node) => {
								if (node) {
									elementDragRefs.current.set(element.sentenceElementId, node)
								} else {
									elementDragRefs.current.delete(element.sentenceElementId)
								}
							}}
							className={`mainElementDragItem ${
								dragState?.elementId === element.sentenceElementId
									? "mainElementDragging"
									: ""
							}`}
							style={
								dragState?.elementId === element.sentenceElementId
									? {
											width: dragState.width,
											height: dragState.height,
										}
									: {
											transform: getDragPreviewTransform(
												element.sentenceElementId,
												index,
											),
										}
							}
							onPointerDown={(e) => startElementPointerDrag(e, element.sentenceElementId)}
							onClickCapture={(e) => {
								if (!suppressElementClick.current) return
								e.preventDefault()
								e.stopPropagation()
							}}
						>
							<div
								className="mainElementDragContent"
								style={
									dragState?.elementId === element.sentenceElementId
										? {
												position: "fixed",
												left: dragState.x,
												top: dragState.y,
												width: dragState.width,
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
								disabled={Boolean(dragState)}
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
						disabled={Boolean(dragState)}
					/>
				)}
			</div>
		</div>
	)
}
