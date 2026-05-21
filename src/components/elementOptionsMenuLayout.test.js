import {
	getPrimaryMenuLayout,
	getSecondaryPlacement,
	isSameMenuLayout,
} from "./elementOptionsMenuLayout"

function rect({ left = 0, top = 0, width = 0, height = 0 }) {
	return {
		left,
		top,
		width,
		height,
		right: left + width,
		bottom: top + height,
	}
}

function elementWithRect(elementRect) {
	return {
		getBoundingClientRect: () => elementRect,
	}
}

describe("element options menu layout", () => {
	const originalInnerWidth = window.innerWidth

	afterEach(() => {
		Object.defineProperty(window, "innerWidth", {
			configurable: true,
			value: originalInnerWidth,
		})
	})

	test("centers the primary menu around the anchor when there is room", () => {
		Object.defineProperty(window, "innerWidth", {
			configurable: true,
			value: 1000,
		})

		const layout = getPrimaryMenuLayout(
			elementWithRect(rect({ left: 400, top: 200, width: 100, height: 40 })),
			elementWithRect(rect({ width: 250, height: 120 })),
		)

		expect(layout).toEqual({
			primaryLeft: 325,
			top: 70,
		})
	})

	test("clamps the primary menu inside the viewport", () => {
		Object.defineProperty(window, "innerWidth", {
			configurable: true,
			value: 320,
		})

		const layout = getPrimaryMenuLayout(
			elementWithRect(rect({ left: 10, top: 200, width: 40, height: 40 })),
			elementWithRect(rect({ width: 250, height: 120 })),
		)

		expect(layout.primaryLeft).toBe(16)
	})

	test("places the secondary menu on the right by default when it fits", () => {
		Object.defineProperty(window, "innerWidth", {
			configurable: true,
			value: 800,
		})

		expect(
			getSecondaryPlacement(
				{ primaryLeft: 100 },
				elementWithRect(rect({ width: 250 })),
				elementWithRect(rect({ width: 250 })),
			),
		).toBe("right")
	})

	test("places the secondary menu on the left when there is no room on the right", () => {
		Object.defineProperty(window, "innerWidth", {
			configurable: true,
			value: 540,
		})

		expect(
			getSecondaryPlacement(
				{ primaryLeft: 260 },
				elementWithRect(rect({ width: 250 })),
				elementWithRect(rect({ width: 250 })),
			),
		).toBe("left")
	})

	test("compares layout positions with a small tolerance", () => {
		expect(
			isSameMenuLayout(
				{ primaryLeft: 100, top: 50 },
				{ primaryLeft: 100.2, top: 50.2 },
			),
		).toBe(true)

		expect(
			isSameMenuLayout(
				{ primaryLeft: 100, top: 50 },
				{ primaryLeft: 101, top: 50 },
			),
		).toBe(false)
	})
})
