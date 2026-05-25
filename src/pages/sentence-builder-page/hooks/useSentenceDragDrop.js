import { useCallback, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { MENU_CLOSE_EVENT } from "../element-options-menu/elementOptionsMenuLayout"

const DRAG_DROP_TRANSITION_MS = 180
const DRAG_START_THRESHOLD = 4
const DRAG_BLOCKED_TARGET_SELECTOR =
	".baseInsideElement, .addButton, input, button, .elementOptionsMenuContainer"

export default function useSentenceDragDrop({ elements, setElements, containerRef, scale }) {
	const elementDragRefs = useRef(new Map())
	const dragStartRef = useRef(null)
	const dragPreviewRef = useRef(null)
	const dropTimeoutRef = useRef(null)
	const isDraggingElement = useRef(false)
	const suppressElementClick = useRef(false)
	const [dragState, setDragState] = useState(null)

	const setElementDragNode = useCallback((elementId, node) => {
		if (node) {
			elementDragRefs.current.set(elementId, node)
		} else {
			elementDragRefs.current.delete(elementId)
		}
	}, [])

	const moveElementToIndex = useCallback(
		(draggedId, insertIndex) => {
			setElements((prev) => {
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
		},
		[setElements],
	)

	const getDragInsertIndex = useCallback(
		(pointerX, draggedId) => {
			const orderedRects = elements
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
		[elements],
	)

	const startElementPointerDrag = useCallback(
		(e, elementId) => {
			if (e.target.closest(DRAG_BLOCKED_TARGET_SELECTOR)) return

			e.preventDefault()
			const rect = e.currentTarget.getBoundingClientRect()
			dragStartRef.current = {
				elementId,
				pointerId: e.pointerId,
				originalIndex: elements.findIndex((element) => element.sentenceElementId === elementId),
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
		(elementId, index) => {
			if (!dragState || dragState.elementId === elementId) return undefined

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
		(viewportLeft, viewportTop) => {
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
		function moveDraggedElement(e) {
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
