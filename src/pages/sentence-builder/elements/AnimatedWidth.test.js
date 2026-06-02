import { act, fireEvent, render, screen } from "@testing-library/react"
import AnimatedWidth from "./AnimatedWidth"

let originalRequestAnimationFrame
let originalCancelAnimationFrame
let originalResizeObserver
let originalScrollWidth

function getAnimatedWidthElement() {
	return screen.getByTestId("animated-content").parentElement.parentElement
}

function fireWidthTransitionEnd(element, propertyName = "width") {
	const event = new Event("transitionend", { bubbles: true })
	Object.defineProperty(event, "propertyName", {
		value: propertyName,
	})
	fireEvent(element, event)
}

beforeEach(() => {
	jest.useFakeTimers()
	originalRequestAnimationFrame = window.requestAnimationFrame
	originalCancelAnimationFrame = window.cancelAnimationFrame
	originalResizeObserver = window.ResizeObserver
	originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth")

	window.requestAnimationFrame = (callback) =>
		window.setTimeout(() => callback(window.performance.now()), 0)
	window.cancelAnimationFrame = (frameId) => window.clearTimeout(frameId)
	window.ResizeObserver = class ResizeObserver {
		observe() {}
		disconnect() {}
	}

	Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
		configurable: true,
		get() {
			return 120
		},
	})
})

afterEach(() => {
	jest.runOnlyPendingTimers()
	jest.useRealTimers()
	window.requestAnimationFrame = originalRequestAnimationFrame
	window.cancelAnimationFrame = originalCancelAnimationFrame
	window.ResizeObserver = originalResizeObserver

	if (originalScrollWidth) {
		Object.defineProperty(HTMLElement.prototype, "scrollWidth", originalScrollWidth)
	} else {
		delete HTMLElement.prototype.scrollWidth
	}

	jest.restoreAllMocks()
})

test("animates open to the measured content width", () => {
	render(
		<AnimatedWidth measureKey="word" isClosing={false} onCloseComplete={jest.fn()}>
			<div data-testid="animated-content">食べる</div>
		</AnimatedWidth>,
	)

	const animatedWidth = getAnimatedWidthElement()
	expect(animatedWidth).toHaveStyle({
		width: "0px",
		overflow: "hidden",
		transition: "width 0.3s ease",
	})

	act(() => {
		jest.advanceTimersByTime(0)
	})

	expect(animatedWidth).toHaveStyle({
		width: "120px",
		overflow: "hidden",
	})

	fireWidthTransitionEnd(animatedWidth)

	expect(animatedWidth).toHaveStyle({
		overflow: "visible",
		transition: "none",
	})
})

test("calls onCloseComplete once after the close width transition finishes", () => {
	const onCloseComplete = jest.fn()
	const { rerender } = render(
		<AnimatedWidth measureKey="word" isClosing={false} onCloseComplete={onCloseComplete}>
			<div data-testid="animated-content">食べる</div>
		</AnimatedWidth>,
	)
	const animatedWidth = getAnimatedWidthElement()

	act(() => {
		jest.advanceTimersByTime(0)
	})

	rerender(
		<AnimatedWidth measureKey="word" isClosing={true} onCloseComplete={onCloseComplete}>
			<div data-testid="animated-content">食べる</div>
		</AnimatedWidth>,
	)
	act(() => {
		jest.advanceTimersByTime(0)
	})

	expect(animatedWidth).toHaveStyle({
		width: "0px",
		overflow: "hidden",
	})

	fireWidthTransitionEnd(animatedWidth, "opacity")
	expect(onCloseComplete).not.toHaveBeenCalled()

	fireWidthTransitionEnd(animatedWidth)
	fireWidthTransitionEnd(animatedWidth)

	expect(onCloseComplete).toHaveBeenCalledTimes(1)
})
