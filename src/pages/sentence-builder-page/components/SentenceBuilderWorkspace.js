import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import AddButton from "./AddButton"
import SentenceText, { elementsToTextParts, textPartsToString } from "./SentenceText"
import "./SentenceBuilderWorkspace.css"
import Element from "../elements/Element"
import { getDefaultElementOptions } from "../elements/elementTypes"
import normalizeElement from "../grammar/normalizeElement"
import useNestedElementPointerGuard from "../hooks/useNestedElementPointerGuard"
import useSentenceDragDrop from "../hooks/useSentenceDragDrop"

const SENTENCE_ELEMENTS_VIEWPORT_PADDING = 100

export default function SentenceBuilderWorkspace({
	generatedElements = [],
	showTranslation,
	resetKey,
	clearKey,
	generatedElementMode,
	canAddElements = true,
	canDragGeneratedElements = false,
	onSentenceChange,
}) {
	const nextElementId = useRef(0)
	const sentenceElementsContainerRef = useRef(null)
	const sentenceElementsScaleRef = useRef(1)
	const scaleFrameRef = useRef(null)
	const scaleTimeoutRef = useRef(null)
	const resetKeyRef = useRef(resetKey)
	const clearKeyRef = useRef(clearKey)
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [sentenceElementsScale, setSentenceElementsScale] = useState(1)
	const sentenceString = textPartsToString(elementsToTextParts(addedElements))
	const defaultElements = useMemo(() => getDefaultElementOptions(), [])
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
	useNestedElementPointerGuard()

	useEffect(() => {
		if (resetKeyRef.current === resetKey) return
		resetKeyRef.current = resetKey
		setAddedElements([])
	}, [resetKey])

	useEffect(() => {
		if (clearKeyRef.current === clearKey) return
		clearKeyRef.current = clearKey
		setAddedElements([])
	}, [clearKey])

	useEffect(() => {
		if (!generatedElements.length) return

		setAddedElements(
			generatedElements.map((element) =>
				createSentenceElement({
					...element,
					isGeneratedPromptElement: true,
				}),
			),
		)
	}, [generatedElements])

	useEffect(() => {
		onSentenceChange?.({
			sentence: sentenceString,
			hasElements: addedElements.length > 0,
		})
	}, [addedElements.length, onSentenceChange, sentenceString])

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
		<>
			<SentenceText addedElements={addedElements} showTranslation={showTranslation} />
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
					const canDragElement =
						!element.isGeneratedPromptElement || canDragGeneratedElements

					return (
						<Fragment key={element.sentenceElementId}>
							<AddButton
								mouse={mouse}
								elementOptions={defaultElements}
								addElement={(selectedElement) => addElement(index, selectedElement)}
								text="word"
								disabled={Boolean(dragState) || !canAddElements}
							/>
							<div
								ref={(node) => {
									setElementDragNode(element.sentenceElementId, node)
								}}
								className={`mainElementDragItem ${
									isDraggingThis ? "mainElementDragging" : ""
								} ${isDroppingThis ? "mainElementDropping" : ""} ${
									canDragElement ? "" : "mainElementDragDisabled"
								}`}
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
								onPointerDown={
									canDragElement
										? (e) => startElementPointerDrag(e, element.sentenceElementId)
										: undefined
								}
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
										generatedElementMode={generatedElementMode}
									/>
								</div>
							</div>
							{index === addedElements.length - 1 && (
								<AddButton
									mouse={mouse}
									elementOptions={defaultElements}
									addElement={(element) => addElement(index + 1, element)}
									text="word"
									disabled={Boolean(dragState) || !canAddElements}
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
						disabled={Boolean(dragState) || !canAddElements}
					/>
				)}
			</div>
		</>
	)
}
