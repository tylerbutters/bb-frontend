import { act, render, screen } from "@testing-library/react"
import { useRef, useState } from "react"
import { MENU_CLOSE_EVENT } from "../element-options-menu/elementsMenuConstants"
import useSentenceDragDrop from "./useSentenceDragDrop"

function mockRect(node, rect) {
	node.getBoundingClientRect = jest.fn(() => ({
		left: rect.left,
		top: rect.top,
		width: rect.width,
		height: rect.height,
		right: rect.left + rect.width,
		bottom: rect.top + rect.height,
	}))
}

function pointerEvent(type, init) {
	const event = new MouseEvent(type, init)
	Object.defineProperty(event, "pointerId", {
		value: init.pointerId,
	})
	return event
}

function DragDropHarness({ initialElements }) {
	const [elements, setElements] = useState(initialElements)
	const containerRef = useRef(null)
	const {
		dragState,
		getDragPreviewTransform,
		setElementDragNode,
		shouldSuppressElementClick,
		startElementPointerDrag,
	} = useSentenceDragDrop({
		elements,
		setElements,
		containerRef,
		scale: 1,
	})

	return (
		<div
			ref={(node) => {
				containerRef.current = node
				if (node) mockRect(node, { left: 0, top: 0, width: 400, height: 100 })
			}}
		>
			<div data-testid="order">{elements.map((element) => element.text).join(",")}</div>
			<div data-testid="dragging">{dragState?.elementId || ""}</div>
			<div data-testid="suppress-click">{String(shouldSuppressElementClick())}</div>
			{elements.map((element, index) => (
				<div
					key={element.sentenceElementId}
					data-testid={`item-${element.sentenceElementId}`}
					style={{ transform: getDragPreviewTransform(element.sentenceElementId, index) }}
					ref={(node) => {
						if (node) {
							mockRect(node, {
								left: index * 100,
								top: 0,
								width: 80,
								height: 40,
							})
						}
						setElementDragNode(element.sentenceElementId, node)
					}}
					onPointerDown={(e) => startElementPointerDrag(e, element.sentenceElementId)}
				>
					{element.text}
				</div>
			))}
		</div>
	)
}

describe("useSentenceDragDrop", () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		act(() => {
			jest.runOnlyPendingTimers()
		})
		jest.useRealTimers()
	})

	test("reorders an element after dragging past another item", () => {
		render(
			<DragDropHarness
				initialElements={[
					{ sentenceElementId: 1, text: "A" },
					{ sentenceElementId: 2, text: "B" },
					{ sentenceElementId: 3, text: "C" },
				]}
			/>,
		)

		act(() => {
			screen.getByTestId("item-1").dispatchEvent(
				pointerEvent("pointerdown", {
					bubbles: true,
					clientX: 10,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		act(() => {
			window.dispatchEvent(
				pointerEvent("pointermove", {
					bubbles: true,
					clientX: 170,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		expect(screen.getByTestId("dragging")).toHaveTextContent("1")

		act(() => {
			window.dispatchEvent(
				pointerEvent("pointerup", {
					bubbles: true,
					clientX: 170,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		expect(screen.getByTestId("order")).toHaveTextContent("B,A,C")

		act(() => {
			jest.advanceTimersByTime(180)
		})

		expect(screen.getByTestId("dragging")).toHaveTextContent("")
	})

	test("dispatches a menu close event when dragging starts", () => {
		const handleMenuClose = jest.fn()
		window.addEventListener(MENU_CLOSE_EVENT, handleMenuClose)

		render(
			<DragDropHarness
				initialElements={[
					{ sentenceElementId: 1, text: "A" },
					{ sentenceElementId: 2, text: "B" },
				]}
			/>,
		)

		act(() => {
			screen.getByTestId("item-1").dispatchEvent(
				pointerEvent("pointerdown", {
					bubbles: true,
					clientX: 10,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		act(() => {
			window.dispatchEvent(
				pointerEvent("pointermove", {
					bubbles: true,
					clientX: 12,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		expect(handleMenuClose).not.toHaveBeenCalled()

		act(() => {
			window.dispatchEvent(
				pointerEvent("pointermove", {
					bubbles: true,
					clientX: 80,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		expect(handleMenuClose).toHaveBeenCalledTimes(1)

		act(() => {
			window.dispatchEvent(
				pointerEvent("pointerup", {
					bubbles: true,
					clientX: 80,
					clientY: 10,
					pointerId: 1,
				}),
			)
		})

		window.removeEventListener(MENU_CLOSE_EVENT, handleMenuClose)
	})
})
