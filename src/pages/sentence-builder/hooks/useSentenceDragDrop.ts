import { useCallback, useEffect, useRef, useState } from "react"
import type { Dispatch, PointerEvent as ReactPointerEvent, RefObject, SetStateAction } from "react"
import { flushSync } from "react-dom"
import { MENU_CLOSE_EVENT } from "../elements-menu/menuEvents"
import type { SentenceElement } from "../types"

const DRAG_DROP_TRANSITION_MS = 180
const DRAG_START_THRESHOLD = 4
const DRAG_BLOCKED_TARGET_SELECTOR =
	".baseInsideElement, .addButton, input, button, .elementsMenuContainer, .flyoutMenuPanel, .menuPanel"

interface DragStart {
	elementId: number
	pointerId: number
	originalIndex: number
	startX: number
	startY: number
	offsetX: number
	offsetY: number
	width: number
	height: number
}

interface DragPreview {
	elementId: number
	insertIndex: number
	width: number
}

export interface ElementDragState extends DragPreview {
	originalIndex: number
	x: number
	y: number
	height: number
	isDropping?: boolean
}

interface UseSentenceDragDropOptions {
	elements: SentenceElement[]
	setElements: Dispatch<SetStateAction<SentenceElement[]>>
	containerRef: RefObject<HTMLElement | null>
	scale: number
}

export default function useSentenceDragDrop({
	elements,
	setElements,
	containerRef,
	scale,
}: UseSentenceDragDropOptions) {
	const elementDragRefs = useRef(new Map<number, HTMLElement>())
	const dragStartRef = useRef<DragStart | null>(null)
	const dragPreviewRef = useRef<DragPreview | null>(null)
	const dropTimeoutRef = useRef<number | null>(null)
	const isDraggingElement = useRef(false)
	const suppressElementClick = useRef(false)
	const [dragState, setDragState] = useState<ElementDragState | null>(null)

	const setElementDragNode = useCallback((elementId: number | undefined, node: HTMLElement | null) => {
		if (elementId == null) return
		if (node) {
			elementDragRefs.current.set(elementId, node)
		} else {
			elementDragRefs.current.delete(elementId)
		}
	}, [])

	const moveElementToIndex = useCallback(
		(draggedId: number, insertIndex: number) => {
			setElements((prev: SentenceElement[]) => {
				const draggedIndex = prev.findIndex((element: SentenceElement) => element.sentenceElementId === draggedId)
				if (draggedIndex === -1) return prev

				const nextElements = [...prev]
				const [draggedElement] = nextElements.splice(draggedIndex, 1)
				const boundedIndex = Math.max(0, Math.min(insertIndex, nextElements.length))

				nextElements.splice(boundedIndex, 0, draggedElement)
				const didOrderChange = nextElements.some(
					(element: SentenceElement, index: number) => element.sentenceElementId !== prev[index].sentenceElementId,
				)
				if (!didOrderChange) return prev

				return nextElements
			})
		},
		[setElements],
	)

	const getDragInsertIndex = useCallback(
		(pointerX: number, draggedId: number) => {
			const orderedRects = elements
				.filter((element: SentenceElement) => element.sentenceElementId !== draggedId)
				.map((element: SentenceElement) => {
					const node = elementDragRefs.current.get(element.sentenceElementId)
					return node
						? {
								elementId: element.sentenceElementId,
								centerX: node.getBoundingClientRect().left + node.getBoundingClientRect().width / 2,
							}
						: null
				})
				.filter((rect): rect is { elementId: number | undefined; centerX: number } => Boolean(rect))

			const targetIndex = orderedRects.findIndex((rect: { centerX: number }) => pointerX < rect.centerX)
			return targetIndex === -1 ? orderedRects.length : targetIndex
		},
		[elements],
	)

	const startElementPointerDrag = useCallback(
		(e: ReactPointerEvent<HTMLElement>, elementId: number | undefined) => {
			if (elementId == null) return
			if (
				e.target instanceof Element &&
				e.target.closest(DRAG_BLOCKED_TARGET_SELECTOR)
			) {
				return
			}

			e.preventDefault()
			const rect = e.currentTarget.getBoundingClientRect()
			dragStartRef.current = {
				elementId,
				pointerId: e.pointerId,
				originalIndex: elements.findIndex((element: SentenceElement) => element.sentenceElementId === elementId),
				startX: e.clientX,
				startY: e.clientY,
				offsetX: e.clientX - rect.left,
				offsetY: e.clientY - rect.top,
				width: rect.width,
				height: rect.height,
			}
		},
		[elements],
	)

	const getDragPreviewTransform = useCallback(
		(elementId: number | undefined, index: number) => {
			if (!dragState || dragState.elementId === elementId) return undefined
			if (dragState.isDropping) return undefined

			const { originalIndex, insertIndex, width } = dragState
			const unscaledWidth = width / scale
			if (insertIndex > originalIndex && index > originalIndex && index <= insertIndex) {
				return `translateX(-${unscaledWidth}px)`
			}

			if (insertIndex < originalIndex && index >= insertIndex && index < originalIndex) {
				return `translateX(${unscaledWidth}px)`
			}

			return undefined
		},
		[dragState, scale],
	)

	const getSentenceLocalPosition = useCallback(
		(viewportLeft: number, viewportTop: number) => {
			const containerRect = containerRef.current?.getBoundingClientRect()
			if (!containerRect) {
				return {
					x: viewportLeft,
					y: viewportTop,
				}
			}

			return {
				x: (viewportLeft - containerRect.left) / scale,
				y: (viewportTop - containerRect.top) / scale,
			}
		},
		[containerRef, scale],
	)

	const shouldSuppressElementClick = useCallback(() => suppressElementClick.current, [])

	useEffect(() => {
		return () => {
			if (dropTimeoutRef.current) {
				window.clearTimeout(dropTimeoutRef.current)
			}
		}
	}, [])

	useEffect(() => {
		function moveDraggedElement(e: PointerEvent) {
			const dragStart = dragStartRef.current
			if (!dragStart) return

			const deltaX = e.clientX - dragStart.startX
			const deltaY = e.clientY - dragStart.startY
			const hasStartedDragging =
				Math.abs(deltaX) > DRAG_START_THRESHOLD || Math.abs(deltaY) > DRAG_START_THRESHOLD

			if (!dragState && !hasStartedDragging) return
			if (!isDraggingElement.current) {
				window.dispatchEvent(new CustomEvent(MENU_CLOSE_EVENT))
			}
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

	return {
		dragState,
		getDragPreviewTransform,
		setElementDragNode,
		shouldSuppressElementClick,
		startElementPointerDrag,
	}
}
