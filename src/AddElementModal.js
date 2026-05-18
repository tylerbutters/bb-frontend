import { useEffect, useState, useRef, useMemo } from "react"
import "./App.css"

export default function AddElementModal({
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	hasDelete,
	isIrregularVerb,
}) {
	const modalRef = useRef(null)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])
	const [searchText, setSearchText] = useState("")

	useEffect(() => {
		function handleClickOutside(e) {
			if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
				closeModal()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [isModalOpen])

	function closeModal() {
		setIsModalOpen(false)
		setSelectedCategory(null)
		setSearchText("")
	}

	function updateSearchResults(e) {
		setSearchText(e.target.value)
		const newSearchResults = elementOptions.filter((element) =>
			element.text.startsWith(e.target.value),
		)
		setSecondaryElementOptions(newSearchResults)
	}

	function onClickElement(selectedElement) {
		if (selectedElement.list && selectedElement.list.length !== 0) {
			setSelectedCategory(selectedElement.text)
			setSecondaryElementOptions(selectedElement.list)
		} else {
			onSelect(selectedElement)
			closeModal()
		}
	}

	if (!isModalOpen) return null

	return (
		<div ref={modalRef} className="addElementModalContainer">
			{selectedCategory && (
				<div className="elementListContainer">
					<ElementListItemContainer
						hasSearch={hasSearch}
						elementOptions={secondaryElementOptions}
						onClickElement={onClickElement}
						hasSearch={true}
					/>
				</div>
			)}
			<div className="elementListContainer">
				<ElementListItemContainer
					hasSearch={hasSearch}
					elementOptions={elementOptions}
					selectedCategory={selectedCategory}
					onClickElement={onClickElement}
				/>
				{hasDelete && (
					<div className="deleteElementButtonContainer">
						<div className="addElementModalButton deleteElementButton" onClick={deleteElement}>
							Delete
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

const PAGE_SIZE = 50

function ElementListItemContainer({ hasSearch, elementOptions, onClickElement, selectedCategory }) {
	const [searchText, setSearchText] = useState("")
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const sentinelRef = useRef(null)
	const filteredOptions = useMemo(() => {
		if (!searchText) return elementOptions
		const query = searchText.toLowerCase()
		return elementOptions.filter((e) => e.text.toLowerCase().startsWith(query))
	}, [elementOptions, searchText])
	const visibleOptions = useMemo(() => {
		return filteredOptions.slice(0, visibleCount)
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
			<div className="elementListItemContainer">
				{visibleOptions.map((element, index) => (
					<div
						key={index}
						className="addElementModalButton"
						style={{
							backgroundColor: selectedCategory === element.text ? "black" : undefined,
							color: selectedCategory === element.text ? "white" : undefined,
						}}
						onClick={() => onClickElement(element)}
					>
						{element.text}
					</div>
				))}
				{/* sentinel triggers loading more */}
				<div ref={sentinelRef} style={{ height: 1 }} />
			</div>
		</>
	)
}
