import { useEffect, useMemo, useRef, useState } from "react"
import JapaneseText from "../components/JapaneseText"
import { filterElementOptions } from "./elementOptionsSearch"
import "./ElementOptionsList.css"

const PAGE_SIZE = 50

export default function ElementOptionsList({
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
					<input
						type="text"
						className="searchInput"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder="Search..."
					/>
				</div>
			)}
			<div
				className="elementListItemContainer"
				style={{ height: hasSearch && 300, width: hasSearch && 250 }}
			>
				{visibleOptions.map((element, index) => (
					<button
						type="button"
						key={index}
						className={`elementOptionsMenuButton ${
							selectedCategory === element?.text && "selectedElementOptionsMenuButton"
						}`}
						onClick={() => onSelectOption(element)}
						title={getMeaningsTitle(element)}
					>
						<div className="elementOptionsMenuButtonText">
							<JapaneseText text={element?.text} reading={element?.textKana} />
						</div>

						{element?.meanings?.length > 0 && (
							<span className="elementOptionsMenuButtonMeanings">
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
