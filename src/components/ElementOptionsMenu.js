import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "../App.css"
import JapaneseText from "./JapaneseText"

const MENU_TRANSITION_MS = 160
const MENU_OPEN_EVENT = "element-options-menu-open"
const MENU_VIEWPORT_PADDING = 16
const MENU_ANCHOR_GAP = 10
const SECONDARY_PANEL_TRANSITION_MS = 320

export default function ElementOptionsMenu({
	anchorRef,
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	hasDelete,
}) {
	const modalRef = useRef(null)
	const menuIdRef = useRef(Symbol("element-options-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])
	const [horizontalOffset, setHorizontalOffset] = useState(0)
	const [menuPosition, setMenuPosition] = useState(null)

	const closeMenu = useCallback(() => {
		setIsModalOpen(false)
	}, [setIsModalOpen])

	const updateMenuPosition = useCallback(() => {
		const anchor = anchorRef?.current
		if (!anchor) return

		const rect = anchor.getBoundingClientRect()
		const nextPosition = {
			left: rect.left + rect.width / 2,
			top: rect.top - MENU_ANCHOR_GAP,
		}

		setMenuPosition((currentPosition) => {
			if (
				currentPosition &&
				Math.abs(currentPosition.left - nextPosition.left) < 0.5 &&
				Math.abs(currentPosition.top - nextPosition.top) < 0.5
			) {
				return currentPosition
			}

			return nextPosition
		})
	}, [anchorRef])

	useEffect(() => {
		if (isModalOpen) {
			setShouldRenderMenu(true)
			window.dispatchEvent(
				new CustomEvent(MENU_OPEN_EVENT, {
					detail: menuIdRef.current,
				}),
			)
			return
		}

		const timeout = setTimeout(() => {
			setShouldRenderMenu(false)
			setSelectedCategory(null)
			setMenuPosition(null)
		}, MENU_TRANSITION_MS)

		return () => clearTimeout(timeout)
	}, [isModalOpen])

	useEffect(() => {
		function handleOtherMenuOpen(e) {
			if (e.detail === menuIdRef.current) return
			closeMenu()
		}

		window.addEventListener(MENU_OPEN_EVENT, handleOtherMenuOpen)
		return () => window.removeEventListener(MENU_OPEN_EVENT, handleOtherMenuOpen)
	}, [closeMenu])

	useEffect(() => {
		function handleClickOutside(e) {
			if (anchorRef?.current?.contains(e.target)) return
			if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
				closeMenu()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [anchorRef, closeMenu, isModalOpen])

	useLayoutEffect(() => {
		if (!shouldRenderMenu) return

		updateMenuPosition()
		const frameId = requestAnimationFrame(updateMenuPosition)

		window.addEventListener("resize", updateMenuPosition)
		window.addEventListener("scroll", updateMenuPosition, true)

		return () => {
			cancelAnimationFrame(frameId)
			window.removeEventListener("resize", updateMenuPosition)
			window.removeEventListener("scroll", updateMenuPosition, true)
		}
	}, [shouldRenderMenu, updateMenuPosition])

	useLayoutEffect(() => {
		if (!shouldRenderMenu || !modalRef.current || !menuPosition) return

		function updateHorizontalOffset() {
			const rect = modalRef.current.getBoundingClientRect()
			const baseLeft = menuPosition.left - rect.width / 2
			const baseRight = menuPosition.left + rect.width / 2
			let adjustment = 0

			if (baseLeft < MENU_VIEWPORT_PADDING) {
				adjustment = MENU_VIEWPORT_PADDING - baseLeft
			} else if (baseRight > window.innerWidth - MENU_VIEWPORT_PADDING) {
				adjustment = window.innerWidth - MENU_VIEWPORT_PADDING - baseRight
			}

			setHorizontalOffset(adjustment)
		}

		setHorizontalOffset(0)
		const frameId = requestAnimationFrame(updateHorizontalOffset)

		const menuTimeoutId = setTimeout(updateHorizontalOffset, MENU_TRANSITION_MS)

		const panelTimeoutId = setTimeout(updateHorizontalOffset, SECONDARY_PANEL_TRANSITION_MS)

		window.addEventListener("resize", updateHorizontalOffset)

		return () => {
			cancelAnimationFrame(frameId)
			clearTimeout(menuTimeoutId)
			clearTimeout(panelTimeoutId)
			window.removeEventListener("resize", updateHorizontalOffset)
		}
	}, [menuPosition, shouldRenderMenu, selectedCategory, secondaryElementOptions])

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

	if (!shouldRenderMenu) return null

	const menu = (
		<div
			ref={modalRef}
			className={`elementOptionsMenuContainer ${
				isModalOpen ? "elementOptionsMenuOpen" : "elementOptionsMenuClosing"
			}`}
			style={{
				left: `${menuPosition?.left || 0}px`,
				top: `${menuPosition?.top || 0}px`,
				visibility: menuPosition ? undefined : "hidden",
				"--menu-horizontal-offset": `${horizontalOffset}px`,
			}}
		>
			{selectedCategory && (
				<ElementOptionsPanel className="secondaryElementOptionsPanel">
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

	return createPortal(menu, document.body)
}

const PAGE_SIZE = 50

function ElementOptionsPanel({ children, hasDelete, onDelete, className = "" }) {
	return (
		<div className={`elementListContainer ${className}`}>
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
			(e) => e?.text?.startsWith(searchText) || e?.textKana?.startsWith(searchText),
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
			<div className="elementListItemContainer" style={{ height: hasSearch && 300 }}>
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
