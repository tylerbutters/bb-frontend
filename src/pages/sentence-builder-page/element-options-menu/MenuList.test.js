import { fireEvent, render, screen } from "@testing-library/react"
import MenuList from "./MenuList"

beforeAll(() => {
	class MockIntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}

	global.IntersectionObserver = MockIntersectionObserver
})

test("stores typed search text instead of the change event", () => {
	render(
		<MenuList
			hasSearch
			elementOptions={[
				{
					text: "走る",
					textKana: "はしる",
					meanings: ["to run"],
				},
			]}
		/>,
	)

	const searchInput = screen.getByPlaceholderText("Search...")
	fireEvent.change(searchInput, { target: { value: "run" } })

	expect(searchInput).toHaveValue("run")
	expect(searchInput).not.toHaveValue("[object Object]")
	expect(screen.getByText("走る")).toBeInTheDocument()
})
