import { fireEvent, render, screen } from "@testing-library/react"
import Counter from "./Counter"

const allColors = {
	counter: {
		secondary: "var(--color-element-counter-secondary)",
	},
}

function renderCounter(props = {}) {
	const updateElement = jest.fn()
	const element = {
		elementType: "counter",
		number: "3",
		text: "個",
		textKana: "こ",
		...props.element,
	}

	render(
		<Counter
			element={element}
			updateElement={updateElement}
			allColors={allColors}
			mouse={{ x: 0, y: 0 }}
		/>,
	)

	return { element, updateElement }
}

describe("Counter", () => {
	test("updates local input state without committing as the number changes", () => {
		const { updateElement } = renderCounter()

		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "12" },
		})

		expect(screen.getByRole("textbox")).toHaveValue("12")
		expect(updateElement).not.toHaveBeenCalled()
	})

	test("commits the current number when pressing Enter", () => {
		const { element, updateElement } = renderCounter()
		const input = screen.getByRole("textbox")

		fireEvent.change(input, {
			target: { value: "12" },
		})
		fireEvent.keyDown(input, { key: "Enter" })

		expect(updateElement).toHaveBeenCalledWith({
			...element,
			number: "12",
		})
	})

	test("does not update the parent element for non-numeric input", () => {
		const { updateElement } = renderCounter()

		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "12a" },
		})

		expect(updateElement).not.toHaveBeenCalled()
		expect(screen.getByRole("textbox")).toHaveValue("3")
	})

	test("still blurs when pressing Enter", () => {
		renderCounter()
		const input = screen.getByRole("textbox")
		input.focus()

		fireEvent.keyDown(input, { key: "Enter" })

		expect(input).not.toHaveFocus()
	})
})
