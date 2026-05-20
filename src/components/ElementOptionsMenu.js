import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "../App.css"

export default function ElementOptionsMenu({
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	hasDelete,
}) {
	const modalRef = useRef(null)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])

	const closeMenu = useCallback(() => {
		setIsModalOpen(false)
		setSelectedCategory(null)
	}, [setIsModalOpen])

	useEffect(() => {
		function handleClickOutside(e) {
			if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
				closeMenu()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [closeMenu, isModalOpen])

	function handleSelectOption(selectedElement, categoryText) {
		onSelect(
			categoryText
				? {
						...selectedElement,
						selectedCategoryText: categoryText,
					}
				: selectedElement,
		)
		closeMenu()
	}

	function handleSelectCategory(selectedElement) {
		if (
			selectedElement.list?.length === 1 &&
			selectedElement.list[0].text === selectedElement.text
		) {
			handleSelectOption(selectedElement.list[0])
		} else if (!selectedElement.list) {
			handleSelectOption(selectedElement)
		} else {
			setSelectedCategory(selectedElement.text)
			setSecondaryElementOptions(selectedElement.list)
		}
	}

	function handleDelete() {
		closeMenu()
		deleteElement()
	}

	if (!isModalOpen) return null

	return (
		<div ref={modalRef} className="elementOptionsMenuContainer">
			{selectedCategory && (
				<ElementOptionsPanel>
					<ElementOptionsList
						hasSearch={true}
						elementOptions={secondaryElementOptions}
						onSelectOption={(selectedElement) =>
							handleSelectOption(selectedElement, selectedCategory)
						}
					/>
				</ElementOptionsPanel>
			)}
			<ElementOptionsPanel hasDelete={hasDelete} onDelete={handleDelete}>
				<ElementOptionsList
					hasSearch={hasSearch}
					elementOptions={elementOptions}
					selectedCategory={selectedCategory}
					onSelectOption={handleSelectCategory}
				/>
			</ElementOptionsPanel>
		</div>
	)
}

const PAGE_SIZE = 50

function ElementOptionsPanel({ children, hasDelete, onDelete }) {
	return (
		<div className="elementListContainer">
			{children}
			{hasDelete && (
				<div className="deleteElementButtonContainer">
					<button
						type="button"
						className="elementOptionsMenuButton deleteElementButton"
						onClick={onDelete}
					>
						Delete
					</button>
				</div>
			)}
		</div>
	)
}

function ElementOptionsList({ hasSearch, elementOptions = [], onSelectOption, selectedCategory }) {
	const [searchText, setSearchText] = useState("")
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const sentinelRef = useRef(null)
	const filteredOptions = useMemo(() => {
		if (!searchText) return elementOptions
		return elementOptions.filter(
			(e) => e?.text.startsWith(searchText) || e?.textKana.startsWith(searchText),
		)
	}, [elementOptions, searchText])

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
						className="elementOptionsMenuButton"
						style={{
							backgroundColor: selectedCategory === element?.text ? "black" : undefined,
							color: selectedCategory === element?.text ? "white" : undefined,
						}}
						onClick={() => onSelectOption(element)}
					>
						{element?.text}
					</div>
				))}
				<div ref={sentinelRef} style={{ height: 1 }} />
			</div>
		</>
	)
}
