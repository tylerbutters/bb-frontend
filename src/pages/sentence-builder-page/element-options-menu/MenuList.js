import { useEffect, useMemo, useRef, useState } from "react"
import InputBox from "../../../components/InputBox"
import JapaneseText from "../components/JapaneseText"
import { filterElementOptions } from "./elementOptionsSearch"
import "./MenuList.css"

const PAGE_SIZE = 50

export default function MenuList({
	hasSearch,
	elementOptions = [],
	onSelectOption,
	selectedCategory,
}) {
	const [searchText, setSearchText] = useState("")
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const sentinelRef = useRef(null)
	const filteredOptions = useMemo(() => {
		if (!hasSearch) return elementOptions
		if (!searchText) return []
		return filterElementOptions(elementOptions, searchText)
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
		const node = sentinelRef.current
		if (node) observer.observe(node)
		return () => {
			if (node) observer.unobserve(node)
			observer.disconnect()
		}
	}, [])

	function getVisibleMeaningsText(element) {
		return element?.meanings?.slice(0, 3).join("; ")
	}

	function getMeaningsTitle(element) {
		return element?.meanings?.join("; ")
	}

	return (
		<>
			{hasSearch && (
				<div className="searchInputContainer">
					<InputBox
						type="text"
						className="searchInput"
						value={searchText}
						onChange={setSearchText}
						placeholder="Search..."
					/>
				</div>
			)}
			<div
				className="menuListItemContainer"
				style={{ height: hasSearch && 300, width: hasSearch && 250 }}
			>
				{visibleOptions.map((element, index) => (
					<button
						type="button"
						key={index}
						className={`elementsMenuButton ${
							selectedCategory === element?.text && "selectedElementsMenuButton"
						}`}
						onClick={() => onSelectOption(element)}
						title={getMeaningsTitle(element)}
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
				))}
				<div ref={sentinelRef} style={{ height: 1 }} />
			</div>
		</>
	)
}
