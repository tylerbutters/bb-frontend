import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import AddButton from "./AddButton"
import SentenceText, { elementsToTextParts, textPartsToString } from "./SentenceText"
import "./SentenceBuilderWorkspace.css"
import Element from "../elements/Element"
import { getDefaultElementOptions } from "../elements/elementTypes"
import normalizeElement from "../grammar/normalizeElement"
import useNestedElementPointerGuard from "../hooks/useNestedElementPointerGuard"
import useSentenceDragDrop from "../hooks/useSentenceDragDrop"
import { MENU_OPEN_EVENT } from "../elements-menu/menuEvents"
import type { MenuOption, MousePosition, SentenceElement } from "../types"

const SENTENCE_ELEMENTS_VIEWPORT_PADDING = 100
const ELEMENT_MENU_SELECTOR = ".elementsMenuContainer,.flyoutMenuPanel,.menuPanel"
const INACTIVE_MENU_MOUSE = {
	x: Number.NEGATIVE_INFINITY,
	y: Number.NEGATIVE_INFINITY,
}

interface SentenceBuilderWorkspaceProps {
	generatedElements?: SentenceElement[]
	showTranslation: boolean
	resetKey: number
	clearKey: number
	generatedElementMode?: string | null
	canAddElements?: boolean
	canDragGeneratedElements?: boolean
	onSentenceChange?: ({
		sentence,
		hasElements,
	}: {
		sentence: string
		hasElements: boolean
	}) => void
}

export default function SentenceBuilderWorkspace({
	generatedElements = [],
	showTranslation,
	resetKey,
	clearKey,
	generatedElementMode,
	canAddElements = true,
	canDragGeneratedElements = false,
	onSentenceChange,
}: SentenceBuilderWorkspaceProps) {
	const nextElementId = useRef(0)
	const sentenceElementsContainerRef = useRef<HTMLDivElement | null>(null)
	const sentenceElementsScaleRef = useRef(1)
	const scaleFrameRef = useRef<number | null>(null)
	const scaleTimeoutRef = useRef<number | null>(null)
	const resetKeyRef = useRef(resetKey)
	const clearKeyRef = useRef(clearKey)
	const [mouse, setMouse] = useState<MousePosition>({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState<SentenceElement[]>([])
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
			generatedElements.map((element: SentenceElement) =>
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
		function handleMove(e: MouseEvent) {
			if (
				(e.target instanceof HTMLElement && e.target.closest(ELEMENT_MENU_SELECTOR)) ||
				document.querySelector(".elementsMenuContainer")
			) {
				setMouse(INACTIVE_MENU_MOUSE)
				return
			}

			setMouse({ x: e.clientX, y: e.clientY })
		}

		function handleMenuOpen() {
			setMouse(INACTIVE_MENU_MOUSE)
		}

		window.addEventListener("mousemove", handleMove)
		window.addEventListener(MENU_OPEN_EVENT, handleMenuOpen)
		return () => {
			window.removeEventListener("mousemove", handleMove)
			window.removeEventListener(MENU_OPEN_EVENT, handleMenuOpen)
		}
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

	function createSentenceElement(selectedElement: SentenceElement | MenuOption): SentenceElement {
		return {
			...normalizeElement(selectedElement as SentenceElement),
			sentenceElementId: nextElementId.current++,
		}
	}

	function addElement(index: number, selectedElement: SentenceElement | MenuOption) {
		setAddedElements((prev) => {
			const copy = [...prev]
			copy.splice(index, 0, createSentenceElement(selectedElement))
			return copy
		})
	}

	function updateElement(elementId: number | undefined, newElement: SentenceElement | MenuOption) {
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

	function deleteElement(elementId: number | undefined) {
		setAddedElements((prev) => prev.filter((element) => element.sentenceElementId !== elementId))
	}

	return (
		<>
			<SentenceText addedElements={addedElements} showTranslation={showTranslation} />
			<div
				ref={sentenceElementsContainerRef}
				className={`sentenceElementsContainer ${dragState ? "sentenceElementsDragging" : ""} ${
					dragState?.isDropping ? "sentenceElementsDropping" : ""
				}`}
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
