import { useEffect, useMemo, useRef, useState } from "react"
import type { FocusEvent, MouseEvent } from "react"
import JapaneseText from "../components/JapaneseText"
import { filterElementOptions } from "./optionSearch"
import type { AnchorRect } from "./anchoredPopover"
import type { ElementOption, MenuOption } from "../types"
import "./MenuList.css"

const PAGE_SIZE = 50
const SEARCH_LIST_STYLE = { height: 300, width: 250 }

export default function MenuList({
	hasSearch = false,
	elementOptions = [],
	isOptionClickable = () => true,
	onSelectOption,
	onHoverOption,
	selectedOptionText,
}: {
	hasSearch?: boolean
	elementOptions?: MenuOption[]
	isOptionClickable?: (option: MenuOption) => boolean
	onSelectOption?: (option: MenuOption) => void
	onHoverOption?: (option: MenuOption, anchorRect: AnchorRect) => void
	selectedOptionText?: string
}) {
	const [searchText, setSearchText] = useState("")
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const loadMoreRef = useRef<HTMLDivElement | null>(null)
	const listStyle = hasSearch ? SEARCH_LIST_STYLE : undefined
	const filteredOptions = useMemo(() => {
		if (!hasSearch) return elementOptions
		if (!searchText) return []
		return filterElementOptions(elementOptions as ElementOption[], searchText)
	}, [elementOptions, hasSearch, searchText])

	const visibleOptions = useMemo(() => {
		return filteredOptions?.slice(0, visibleCount) || []
	}, [filteredOptions, visibleCount])

	useEffect(() => {
		setVisibleCount(PAGE_SIZE)
	}, [searchText, elementOptions])

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0]
				if (target.isIntersecting) {
					setVisibleCount((prev) => prev + PAGE_SIZE)
				}
			},
			{
				root: null,
				rootMargin: "100px",
				threshold: 0,
			},
		)
		const node = loadMoreRef.current
		if (node) observer.observe(node)
		return () => {
			if (node) observer.unobserve(node)
			observer.disconnect()
		}
	}, [])

	return (
		<>
			{hasSearch && (
				<div className="searchInputContainer">
					<input
						type="text"
						className="searchInput"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder="Search..."
					/>
				</div>
			)}
			<div className="menuListItemContainer" style={listStyle}>
				{visibleOptions.map((element, index) => (
					<MenuOptionButton
						key={getMenuOptionKey(element, index)}
						element={element}
						isClickable={isOptionClickable(element)}
						isSelected={selectedOptionText === element?.text}
						onHoverOption={onHoverOption}
						onSelectOption={onSelectOption}
					/>
				))}
				<div ref={loadMoreRef} style={{ height: 1 }} />
			</div>
		</>
	)
}

function MenuOptionButton({
	element,
	isClickable,
	isSelected,
	onHoverOption,
	onSelectOption,
}: {
	element: MenuOption
	isClickable: boolean
	isSelected: boolean
	onHoverOption?: (option: MenuOption, anchorRect: AnchorRect) => void
	onSelectOption?: (option: MenuOption) => void
}) {
	function showDetail(e: FocusEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) {
		onHoverOption?.(element, getOptionAnchorRect(e))
	}

	function selectOption() {
		onSelectOption?.(element)
	}

	return (
		<button
			type="button"
			className={[
				"elementsMenuButton",
				isSelected ? "selectedElementsMenuButton" : "",
			]
				.filter(Boolean)
				.join(" ")}
			onClick={isClickable ? selectOption : undefined}
			onFocus={showDetail}
			onMouseEnter={showDetail}
		>
			<div className="elementsMenuButtonText">
				<JapaneseText text={element?.text} reading={element?.textKana} />
			</div>

			{element?.meanings?.length > 0 && (
				<span className="elementsMenuButtonMeanings">
					{getVisibleMeaningsText(element)}
				</span>
			)}
		</button>
	)
}

function getVisibleMeaningsText(element: MenuOption) {
	return element?.meanings?.slice(0, 3).join("; ")
}

function getMenuOptionKey(element: MenuOption, index: number) {
	const optionParts = [
		element?.detailId,
		element?.elementType,
		element?.text,
		element?.textKana,
	].filter(Boolean)

	return optionParts.length > 0 ? `${optionParts.join(":")}:${index}` : index
}

function getOptionAnchorRect(e: FocusEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>): AnchorRect {
	const rect = e.currentTarget.getBoundingClientRect()

	return {
		top: rect.top,
		right: rect.right,
		bottom: rect.bottom,
		left: rect.left,
		width: rect.width,
		height: rect.height,
	}
}
