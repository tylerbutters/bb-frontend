import { useEffect, useState, useRef, useMemo } from "react"
import "./App.css"

export default function AddElementModal({
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	isElement,
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
				{isElement && (
					<div className="addElementModalButton deleteElementButton" onClick={deleteElement}>
						Delete
					</div>
				)}
			</div>
		</div>
	)
}

function ElementListItemContainer({ hasSearch, elementOptions, onClickElement, selectedCategory }) {
	const [searchText, setSearchText] = useState("")
	const [elementResults, setElementResults] = useState([])

	useEffect(() => {
		setElementResults(elementOptions)
	}, [elementOptions])

	function updateSearchResults(e) {
		setSearchText(e.target.value)
		const newSearchResults = elementOptions.filter((element) =>
			element.text.startsWith(e.target.value),
		)
		setElementResults(newSearchResults)
	}

	return (
		<>
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
				{elementOptions &&
					elementOptions.map((element, index) => (
						<div
							className="addElementModalButton"
							style={{
								backgroundColor: selectedCategory === element.text && "black",
								color: selectedCategory === element.text && "white",
							}}
							key={index}
							onClick={() => onClickElement(element)}
						>
							{element.text}
						</div>
					))}
			</div>
		</>
	)
}
