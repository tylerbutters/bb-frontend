import type { ComponentProps, RefObject } from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import ElementsMenu from "./ElementsMenu"
import { MENU_TRANSITION_MS } from "./menuEvents"

type ElementsMenuTestProps = Partial<ComponentProps<typeof ElementsMenu>>

beforeAll(() => {
	class MockIntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}

	global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
})

afterEach(() => {
	jest.useRealTimers()
})

function createRect({
	top = 0,
	right = 0,
	bottom = 0,
	left = 0,
	width = right - left,
	height = bottom - top,
}: Partial<DOMRect>): DOMRect {
	return {
		x: left,
		y: top,
		top,
		right,
		bottom,
		left,
		width,
		height,
		toJSON: () => ({}),
	} as DOMRect
}

function getMenuProps(
	props: ElementsMenuTestProps = {},
	anchorRef: RefObject<HTMLElement | null> = { current: document.createElement("button") },
): ComponentProps<typeof ElementsMenu> {
	return {
		anchorRef,
		isModalOpen: true,
		setIsModalOpen: jest.fn(),
		onSelect: jest.fn(),
		secondHasSearch: false,
		elementOptions: [
			{
				text: "か",
				list: [{ text: "ない" }, { text: "れる" }],
			},
		],
		...props,
	}
}

function renderOpenMenu(props: ElementsMenuTestProps = {}, anchorRect?: DOMRect) {
	const anchor = document.createElement("button")
	const anchorRef: RefObject<HTMLElement | null> = { current: anchor }
	if (anchorRect) {
		anchor.getBoundingClientRect = jest.fn(() => anchorRect)
	}

	return {
		anchor,
		anchorRef,
		...render(<ElementsMenu {...getMenuProps(props, anchorRef)} />),
	}
}

test("positions the primary menu from the opening anchor rect", () => {
	renderOpenMenu(
		{},
		createRect({
			top: 220,
			right: 180,
			bottom: 250,
			left: 120,
			width: 60,
			height: 30,
		}),
	)

	expect(document.querySelector(".elementsMenuContainer")).toHaveStyle({
		left: "150px",
	})
})

test("keeps the primary menu position after the anchor geometry changes", () => {
	const openingRect = createRect({
		top: 220,
		right: 180,
		bottom: 250,
		left: 120,
		width: 60,
		height: 30,
	})
	const changedRect = createRect({
		top: 220,
		right: 700,
		bottom: 250,
		left: 400,
		width: 300,
		height: 30,
	})
	const { anchor, anchorRef, rerender } = renderOpenMenu({}, openingRect)

	expect(document.querySelector(".elementsMenuContainer")).toHaveStyle({
		left: "150px",
	})

	;(anchor.getBoundingClientRect as jest.Mock).mockReturnValue(changedRect)
	rerender(<ElementsMenu {...getMenuProps({}, anchorRef)} />)

	expect(document.querySelector(".elementsMenuContainer")).toHaveStyle({
		left: "150px",
	})
})

test("opens a secondary menu from hover", () => {
	renderOpenMenu()

	fireEvent.mouseEnter(screen.getByRole("button", { name: "か" }))

	expect(screen.getByRole("button", { name: "ない" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "れる" })).toBeInTheDocument()
})

test("positions a hover-opened secondary menu from the hovered option", () => {
	renderOpenMenu()

	const categoryButton = screen.getByRole("button", { name: "か" })
	categoryButton.getBoundingClientRect = jest.fn(() => createRect({
		top: 120,
		right: 240,
		bottom: 150,
		left: 200,
		width: 40,
		height: 30,
	}))

	fireEvent.mouseEnter(categoryButton)

	expect(document.querySelector(".flyoutMenuPanel")).toHaveStyle({
		left: "240px",
		top: "120px",
	})
})

test("renders hover-opened secondary menus as submenu flyouts", () => {
	renderOpenMenu()

	fireEvent.mouseEnter(screen.getByRole("button", { name: "か" }))

	expect(document.querySelector(".flyoutMenuPanel")).toHaveClass(
		"flyoutMenuPanel-submenu",
	)
})

test("opens element detail immediately from hover", () => {
	renderOpenMenu({
		elementOptions: [{ text: "ない", detailId: "verb-negative" }],
	})

	fireEvent.mouseEnter(screen.getByRole("button", { name: "ない" }))

	expect(screen.getByText("Negative")).toBeInTheDocument()
	expect(screen.getByText("To not do")).toBeInTheDocument()
})

test("opens detail for direct-select da category on hover", () => {
	renderOpenMenu({
		elementOptions: [
			{
				text: "だ",
				list: [
					{
						elementType: "desu",
						text: "だ",
						stem: "だ",
						detailId: "copula-non-past",
					},
				],
			},
		],
	})

	fireEvent.mouseEnter(screen.getByRole("button", { name: "だ" }))

	expect(screen.getAllByRole("button", { name: "だ" })).toHaveLength(1)
	expect(screen.getByText("Copula")).toBeInTheDocument()
	expect(screen.getByText("Non-past")).toBeInTheDocument()
	expect(screen.getByText("Is")).toBeInTheDocument()
})

test("positions element detail from the hovered option", () => {
	renderOpenMenu({
		elementOptions: [{ text: "ない", detailId: "verb-negative" }],
	})

	const detailButton = screen.getByRole("button", { name: "ない" })
	detailButton.getBoundingClientRect = jest.fn(() => createRect({
		top: 120,
		right: 240,
		bottom: 150,
		left: 200,
		width: 40,
		height: 30,
	}))

	fireEvent.mouseEnter(detailButton)

	expect(document.querySelector(".flyoutMenuPanel")).toHaveStyle({
		left: "240px",
		top: "120px",
	})
})

test("keeps primary detail open after leaving the hovered option", () => {
	renderOpenMenu({
		elementOptions: [
			{ text: "ない", detailId: "verb-negative" },
			{ text: "。" },
		],
	})

	const detailButton = screen.getByRole("button", { name: "ない" })
	fireEvent.mouseEnter(detailButton)

	expect(screen.getByText("Negative")).toBeInTheDocument()
	expect(detailButton).toHaveClass("selectedElementsMenuButton")

	fireEvent.mouseLeave(detailButton)
	fireEvent.mouseLeave(document.querySelector(".menuListItemContainer"))

	expect(screen.getByText("Negative")).toBeInTheDocument()
	expect(detailButton).toHaveClass("selectedElementsMenuButton")

	fireEvent.mouseEnter(screen.getByRole("button", { name: "。" }))

	expect(screen.queryByText("Negative")).not.toBeInTheDocument()
	expect(detailButton).not.toHaveClass("selectedElementsMenuButton")
})

test("keeps a hover-opened secondary menu after leaving the primary option", () => {
	const onSelect = jest.fn()
	renderOpenMenu({ onSelect })

	const categoryButton = screen.getByRole("button", { name: "か" })
	fireEvent.mouseEnter(categoryButton)
	expect(screen.getByRole("button", { name: "ない" })).toBeInTheDocument()
	expect(categoryButton).toHaveClass("selectedElementsMenuButton")

	fireEvent.mouseLeave(categoryButton)

	fireEvent.click(screen.getByRole("button", { name: "ない" }))
	expect(onSelect).toHaveBeenCalledWith({
		text: "ない",
		selectedCategoryText: "か",
	})
})

test("shows detail in another layer when hovering an option in a secondary menu", () => {
	const onSelect = jest.fn()
	renderOpenMenu({
		onSelect,
		elementOptions: [
			{
				text: "か",
				list: [{ text: "ない", detailId: "verb-negative" }, { text: "れる" }],
			},
		],
	})

	fireEvent.mouseEnter(screen.getByRole("button", { name: "か" }))

	const secondaryOption = screen.getByRole("button", { name: "ない" })
	secondaryOption.getBoundingClientRect = jest.fn(() => createRect({
		top: 170,
		right: 360,
		bottom: 200,
		left: 320,
		width: 40,
		height: 30,
	}))
	fireEvent.mouseEnter(secondaryOption)

	expect(screen.getByText("Negative")).toBeInTheDocument()
	expect(screen.getByText("To not do")).toBeInTheDocument()
	const flyoutPanels = document.querySelectorAll(".flyoutMenuPanel")
	expect(flyoutPanels).toHaveLength(2)
	expect(flyoutPanels[0]).toHaveClass("flyoutMenuPanel-submenu")
	expect(flyoutPanels[1]).toHaveClass("flyoutMenuPanel-layer", "flyoutMenuPanel-detail")
	expect(flyoutPanels[1]).toHaveStyle({
		left: "360px",
		top: "170px",
	})

	fireEvent.click(secondaryOption)
	expect(onSelect).toHaveBeenCalledWith({
		text: "ない",
		detailId: "verb-negative",
		selectedCategoryText: "か",
	})
})

test("keeps secondary detail open after leaving the hovered submenu option", () => {
	renderOpenMenu({
		elementOptions: [
			{
				text: "か",
				list: [{ text: "ない", detailId: "verb-negative" }, { text: "れる" }],
			},
		],
	})

	fireEvent.mouseEnter(screen.getByRole("button", { name: "か" }))

	const secondaryOption = screen.getByRole("button", { name: "ない" })
	fireEvent.mouseEnter(secondaryOption)

	expect(screen.getByText("Negative")).toBeInTheDocument()
	expect(secondaryOption).toHaveClass("selectedElementsMenuButton")

	fireEvent.mouseLeave(secondaryOption)
	fireEvent.mouseLeave(document.querySelector(".flyoutMenuPanel-submenu .menuListItemContainer"))

	expect(screen.getByText("Negative")).toBeInTheDocument()
	expect(secondaryOption).toHaveClass("selectedElementsMenuButton")

	fireEvent.mouseEnter(screen.getByRole("button", { name: "れる" }))

	expect(screen.queryByText("Negative")).not.toBeInTheDocument()
	expect(secondaryOption).not.toHaveClass("selectedElementsMenuButton")
	expect(document.querySelectorAll(".flyoutMenuPanel")).toHaveLength(1)
})

test("does not toggle a hover-opened secondary menu when clicking the primary option", () => {
	renderOpenMenu()

	const categoryButton = screen.getByRole("button", { name: "か" })
	fireEvent.mouseEnter(categoryButton)
	expect(screen.getByRole("button", { name: "ない" })).toBeInTheDocument()

	fireEvent.click(categoryButton)

	expect(screen.getByRole("button", { name: "ない" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "れる" })).toBeInTheDocument()
})

test("does not open a secondary menu from click alone", () => {
	renderOpenMenu()

	fireEvent.click(screen.getByRole("button", { name: "か" }))

	expect(screen.queryByRole("button", { name: "ない" })).not.toBeInTheDocument()
	expect(screen.queryByRole("button", { name: "れる" })).not.toBeInTheDocument()
})

test("keeps flyout panels mounted with closing animation while the menu closes", () => {
	jest.useFakeTimers()
	const { anchorRef, rerender } = renderOpenMenu({
		elementOptions: [
			{
				text: "か",
				list: [{ text: "ない", detailId: "verb-negative" }, { text: "れる" }],
			},
		],
	})

	fireEvent.mouseEnter(screen.getByRole("button", { name: "か" }))
	fireEvent.mouseEnter(screen.getByRole("button", { name: "ない" }))

	expect(document.querySelectorAll(".flyoutMenuPanel")).toHaveLength(2)

	rerender(
		<ElementsMenu
			{...getMenuProps({ isModalOpen: false }, anchorRef)}
		/>,
	)

	expect(document.querySelector(".elementsMenuContainer")).toHaveClass(
		"elementsMenuClosing",
	)
	document.querySelectorAll(".flyoutMenuPanel").forEach((panel) => {
		expect(panel).toHaveClass("flyoutMenuPanelClosing")
	})

	act(() => {
		jest.advanceTimersByTime(MENU_TRANSITION_MS)
	})

	expect(document.querySelector(".elementsMenuContainer")).not.toBeInTheDocument()
	expect(document.querySelector(".flyoutMenuPanel")).not.toBeInTheDocument()
})

test("opens a secondary menu from hover by default", () => {
	renderOpenMenu()

	fireEvent.mouseEnter(screen.getByRole("button", { name: "か" }))

	expect(screen.getByRole("button", { name: "ない" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "れる" })).toBeInTheDocument()
})

test("does not open a secondary menu for direct-select categories on hover", () => {
	renderOpenMenu({
		elementOptions: [
			{
				text: "いて",
				list: [{ text: "いて", detailId: "verb-te-form" }],
			},
		],
	})

	fireEvent.mouseEnter(screen.getByRole("button", { name: "いて" }))

	expect(screen.getAllByRole("button", { name: "いて" })).toHaveLength(1)
})
