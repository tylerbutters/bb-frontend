import { useEffect, useState, useRef } from "react"
import "./App.css"

export default function AddElementModal({
	isElement,
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elements,
	hasSearch,
	deleteElement,
}) {
	const modalRef = useRef(null)
	const [selectedCategory, setSelectedCategory] = useState()
	const [searchText, setSearchText] = useState("")
	const [elementResults, setElementResults] = useState([])

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
		setElementResults([])
	}

	function updateSearchResults(e) {
		const value = e.target.value

		setSearchText(value)
		// alert(JSON.stringify(searchResults))
		const newResults = elements[selectedCategory].filter(
			(element) => element.kana?.startsWith(value) || element.word?.startsWith(value),
		)

		setElementResults(newResults)
	}

	function onClickDelete() {
		deleteElement()
		closeModal()
	}

	function onClickElement(selectedValue) {
		// alert(JSON.stringify(selectedValue))
		onSelect({ type: selectedCategory, value: selectedValue })
		closeModal()
	}

	function onClickCategory(category) {
		// alert(JSON.stringify(elements[category]))
		if (Array.isArray(elements[category]) && elements[category].length !== 0) {
			setSelectedCategory(category)
			setElementResults(elements[category])
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
						{elementResults?.map((element) => (
							<div
								className="addElementModalButton"
								key={element.word}
								onClick={() => onClickElement(element)}
							>
								{element.word || element}
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
					<div className="addElementModalButton deleteButton" onClick={onClickDelete}>
						Delete
					</div>
				)}
			</div>
		</div>
	)
}
