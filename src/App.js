import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import "./App.css"
import AddButton from "./components/AddButton"
import Element from "./elements/Element"
import SentenceText from "./SentenceText"
import dictionary from "./jmdict/processed-jmdict.json"
import useGrammarStore from "./store/useGrammarStore"

const SENTENCE_ELEMENTS_VIEWPORT_PADDING = 100
const DRAG_DROP_TRANSITION_MS = 180

export default function App() {
	const nextElementId = useRef(0)
	const elementDragRefs = useRef(new Map())
	const dragStartRef = useRef(null)
	const dragPreviewRef = useRef(null)
	const sentenceElementsContainerRef = useRef(null)
	const sentenceElementsScaleRef = useRef(1)
	const scaleFrameRef = useRef(null)
	const scaleTimeoutRef = useRef(null)
	const dropTimeoutRef = useRef(null)
	const isDraggingElement = useRef(false)
	const suppressElementClick = useRef(false)
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [dragState, setDragState] = useState(null)
	const [sentenceElementsScale, setSentenceElementsScale] = useState(1)
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

	useEffect(() => {
		return () => {
			if (dropTimeoutRef.current) {
				window.clearTimeout(dropTimeoutRef.current)
			}
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

	const getDragInsertIndex = useCallback(
		(pointerX, draggedId) => {
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
		},
		[addedElements],
	)

	function startElementPointerDrag(e, elementId) {
		if (
			e.target.closest(
				".baseInsideElement, .addButton, input, button, .elementOptionsMenuContainer",
			)
		) {
			return
		}

		e.preventDefault()
		const rect = e.currentTarget.getBoundingClientRect()
		dragStartRef.current = {
			elementId,
			pointerId: e.pointerId,
			originalIndex: addedElements.findIndex((element) => element.sentenceElementId === elementId),
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
		const unscaledWidth = width / sentenceElementsScale
		if (insertIndex > originalIndex && index > originalIndex && index <= insertIndex) {
			return `translateX(-${unscaledWidth}px)`
		}

		if (insertIndex < originalIndex && index >= insertIndex && index < originalIndex) {
			return `translateX(${unscaledWidth}px)`
		}

		return undefined
	}

	const getSentenceLocalPosition = useCallback((viewportLeft, viewportTop) => {
		const containerRect = sentenceElementsContainerRef.current?.getBoundingClientRect()
		if (!containerRect) {
			return {
				x: viewportLeft,
				y: viewportTop,
			}
		}

		return {
			x: (viewportLeft - containerRect.left) / sentenceElementsScale,
			y: (viewportTop - containerRect.top) / sentenceElementsScale,
		}
	}, [sentenceElementsScale])

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
			const localPosition = getSentenceLocalPosition(
				e.clientX - dragStart.offsetX,
				e.clientY - dragStart.offsetY,
			)

			setDragState({
				elementId: dragStart.elementId,
				originalIndex: dragStart.originalIndex,
				insertIndex,
				x: localPosition.x,
				y: localPosition.y,
				width: dragStart.width,
				height: dragStart.height,
			})
		}

		function finishDraggedElement() {
			const activeDragState = dragState
			const dragPreview = dragPreviewRef.current
			if (isDraggingElement.current) {
				suppressElementClick.current = true
				window.setTimeout(() => {
					suppressElementClick.current = false
				}, 0)
			}

			isDraggingElement.current = false
			dragStartRef.current = null
			dragPreviewRef.current = null

			if (dropTimeoutRef.current) {
				window.clearTimeout(dropTimeoutRef.current)
				dropTimeoutRef.current = null
			}

			if (dragPreview && activeDragState) {
				flushSync(() => {
					moveElementToIndex(dragPreview.elementId, dragPreview.insertIndex)
				})

				const targetNode = elementDragRefs.current.get(dragPreview.elementId)
				const targetRect = targetNode?.getBoundingClientRect()

				if (targetRect) {
					const localPosition = getSentenceLocalPosition(targetRect.left, targetRect.top)
					setDragState({
						...activeDragState,
						x: localPosition.x,
						y: localPosition.y,
						width: targetRect.width,
						height: targetRect.height,
						isDropping: true,
					})

					dropTimeoutRef.current = window.setTimeout(() => {
						dropTimeoutRef.current = null
						setDragState(null)
					}, DRAG_DROP_TRANSITION_MS)
					return
				}
			}

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
	}, [dragState, getDragInsertIndex, getSentenceLocalPosition, moveElementToIndex])

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
									if (node) {
										elementDragRefs.current.set(element.sentenceElementId, node)
									} else {
										elementDragRefs.current.delete(element.sentenceElementId)
									}
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
									if (!suppressElementClick.current) return
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
