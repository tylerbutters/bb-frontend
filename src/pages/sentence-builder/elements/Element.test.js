import { fireEvent, render, screen } from "@testing-library/react"
import Element from "./Element"

beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		disconnect() {}
	}
	global.IntersectionObserver = class IntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

const generatedVerbWithConjugation = {
	sentenceElementId: 1,
	isGeneratedPromptElement: true,
	elementType: "verb",
	text: "食べる",
	stem: "食べ",
	ending: "る",
	verbType: "ichidan",
	conjugation: {
		stem: "ない",
		conjugation: {},
	},
}

const defaultProps = {
	element: generatedVerbWithConjugation,
	mouse: { x: 0, y: 0 },
	updateElement: jest.fn(),
	deleteElement: jest.fn(),
	defaultElements: [],
}

function renderElement(props = {}) {
	return render(<Element {...defaultProps} {...props} />)
}

function getConjugationElement(container) {
	return container.querySelector(".conjugationElement")
}

function getBaseElementContainer(container) {
	return container.querySelector(".elementContainer")
}

describe("Element", () => {
	test("allows conjugation edits on generated fix sentence elements", () => {
		const { container } = renderElement({ generatedElementMode: "fix sentence" })
		const conjugationElement = getConjugationElement(container)

		expect(conjugationElement).not.toHaveClass("baseInsideElementLocked")

		fireEvent.click(conjugationElement)

		expect(screen.getByText("Conjugation")).toBeInTheDocument()
	})

	test("keeps conjugations locked for generated particle prompts", () => {
		const { container } = renderElement({ generatedElementMode: "particles" })
		const conjugationElement = getConjugationElement(container)

		expect(conjugationElement).toHaveClass("baseInsideElementLocked")

		fireEvent.click(conjugationElement)

		expect(screen.queryByText("Conjugation")).not.toBeInTheDocument()
	})

	test("allows deleting generated fix sentence words", () => {
		const { container } = renderElement({ generatedElementMode: "fix sentence" })

		fireEvent.click(getBaseElementContainer(container))

		expect(screen.getByText("Word")).toBeInTheDocument()
		expect(screen.getByText("Delete")).toBeInTheDocument()
	})
})
