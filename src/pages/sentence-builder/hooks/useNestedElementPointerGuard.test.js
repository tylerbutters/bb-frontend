import { fireEvent, render, screen } from "@testing-library/react"
import useNestedElementPointerGuard from "./useNestedElementPointerGuard"

function TestNestedElementPointerGuard() {
	useNestedElementPointerGuard()

	return (
		<>
			<div data-testid="element" className="elementContainer">
				<button type="button">Nested button</button>
			</div>
			<div data-testid="locked-element" className="elementContainer elementContainerLocked" />
			<div data-testid="locked-inside" className="baseInsideElement baseInsideElementLocked" />
			<div data-testid="menu" className="elementsMenuContainer">
				<div data-testid="menu-child" className="elementContainer" />
			</div>
		</>
	)
}

test("adds and clears pressed classes for direct element pointer events", () => {
	render(<TestNestedElementPointerGuard />)
	const element = screen.getByTestId("element")

	fireEvent.pointerDown(element)
	expect(element).toHaveClass("pressedElement")

	fireEvent.pointerUp(document)
	expect(element).not.toHaveClass("pressedElement")
})

test("does not press a parent element when a nested control is pressed", () => {
	render(<TestNestedElementPointerGuard />)
	const element = screen.getByTestId("element")
	const nestedButton = screen.getByRole("button", { name: "Nested button" })

	fireEvent.pointerDown(nestedButton)

	expect(element).not.toHaveClass("pressedElement")
	expect(nestedButton).not.toHaveClass("pressedElement")
})

test("adds hover classes outside menus and clears them on pointer out", () => {
	render(<TestNestedElementPointerGuard />)
	const element = screen.getByTestId("element")

	fireEvent.pointerOver(element)
	expect(element).toHaveClass("hoverElement")

	fireEvent.pointerOut(element, { relatedTarget: document.body })
	expect(element).not.toHaveClass("hoverElement")
})

test("does not hover parent-style element nodes inside option menus", () => {
	render(<TestNestedElementPointerGuard />)
	const menuChild = screen.getByTestId("menu-child")

	fireEvent.pointerOver(menuChild)

	expect(menuChild).not.toHaveClass("hoverElement")
})

test("does not add feedback classes to locked elements", () => {
	render(<TestNestedElementPointerGuard />)
	const lockedElement = screen.getByTestId("locked-element")
	const lockedInsideElement = screen.getByTestId("locked-inside")

	fireEvent.pointerOver(lockedElement)
	fireEvent.pointerDown(lockedElement)

	expect(lockedElement).not.toHaveClass("hoverElement")
	expect(lockedElement).not.toHaveClass("pressedElement")

	fireEvent.pointerOver(lockedInsideElement)
	fireEvent.pointerDown(lockedInsideElement)

	expect(lockedInsideElement).not.toHaveClass("hoverElement")
	expect(lockedInsideElement).not.toHaveClass("pressedElement")
})
