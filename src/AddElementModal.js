import { useEffect, useState, useRef, useMemo } from "react"
import "./App.css"

export default function AddElementModal({
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elements,
	deleteElement,
	hasSearch,
	isElement,
	isIrregularVerb,
}) {
	const modalRef = useRef(null)
	const [selectedCategory, setSelectedCategory] = useState()
	const [searchText, setSearchText] = useState("")

	const elementResults = useMemo(() => {
		if (!selectedCategory) return []

		const list = elements?.[selectedCategory] || []

		if (!searchText) return list

		const lower = searchText.toLowerCase()

		return list.filter((element) => (element.value || element).toLowerCase().startsWith(lower))
	}, [elements, selectedCategory, searchText])

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
	}

	function onClickElement(selectedValue) {
		// alert(JSON.stringify(selectedValue))
		onSelect({ type: selectedCategory, value: selectedValue })
		closeModal()
	}

	function onClickCategory(category) {
		if (Array.isArray(elements[category]) && elements[category].length !== 0) {
			setSelectedCategory(category)
			setSearchText("")
		} else {
			onSelect({ type: null, value: category })
			closeModal()
		}
	}

	if (!isModalOpen) return null

	if (Array.isArray(elements)) {
		// alert("yes")
		return (
			<div ref={modalRef} className="addElementModalContainer">
				<div className="elementListContainer">
					<div className="elementListItemContainer">
						{elements?.map((value) => (
							<div
								className="addElementModalButton"
								key={value}
								onClick={() => onClickElement(value)}
							>
								{value}
							</div>
						))}
					</div>
					{isIrregularVerb && (
						<div className="addElementModalButton deleteElementButton" onClick={deleteElement}>
							Delete
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div ref={modalRef} className="addElementModalContainer">
			{selectedCategory && (
				<div className="elementListContainer">
					{hasSearch && (
						<div className="searchInputContainer">
							<input
								type="text"
								className="searchInput"
								value={searchText}
								onChange={updateSearchResults}
								placeholder="Search..."
							/>
						</div>
					)}
					<div className="elementListItemContainer">
						{elementResults?.map((element, index) => (
							<div
								className="addElementModalButton"
								key={index}
								onClick={() => onClickElement(element)}
							>
								{element.value || element}
							</div>
						))}
					</div>
				</div>
			)}
			<div className="categoryModalContainer">
				{elements &&
					Object.keys(elements).map((category) => (
						<div
							className="addElementModalButton"
							style={{
								backgroundColor: selectedCategory === category && "black",
								color: selectedCategory === category && "white",
							}}
							key={category}
							onClick={() => onClickCategory(category)}
						>
							{category}
						</div>
					))}
				{isElement && (
					<div className="addElementModalButton deleteElementButton" onClick={deleteElement}>
						Delete
					</div>
				)}
			</div>
		</div>
	)
}
