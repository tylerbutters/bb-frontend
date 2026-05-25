import { useEffect } from "react"

const ELEMENT_POINTER_SELECTOR = ".baseInsideElement,.elementContainer,.addButton"
const ELEMENT_MENU_SELECTOR = ".elementOptionsMenuContainer"
const NESTED_CONTROL_SELECTOR = "input, button"

export default function useNestedElementPointerGuard() {
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

			if (e.target.closest(NESTED_CONTROL_SELECTOR)) return

			pressedElement = e.target.closest(ELEMENT_POINTER_SELECTOR)
			pressedElement?.classList.add("pressedElement")
		}

		function handlePointerOver(e) {
			if (e.target.closest(ELEMENT_MENU_SELECTOR)) return

			const element = e.target.closest(ELEMENT_POINTER_SELECTOR)
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
}
