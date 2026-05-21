import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "../App.css"
import ElementOptionsList from "./ElementOptionsList"
import {
	getPrimaryMenuLayout,
	getSecondaryPlacement,
	isSameMenuLayout,
	MENU_OPEN_EVENT,
	MENU_TRANSITION_MS,
} from "./elementOptionsMenuLayout"

export default function ElementOptionsMenu({
	anchorRef,
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	secondHasSearch = true,
	hasDelete,
	menuTitle,
}) {
	const modalRef = useRef(null)
	const primaryPanelRef = useRef(null)
	const secondaryPanelRef = useRef(null)
	const menuIdRef = useRef(Symbol("element-options-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])
	const [secondaryPlacement, setSecondaryPlacement] = useState("right")
	const [menuLayout, setMenuLayout] = useState(null)

	const closeMenu = useCallback(() => {
		setIsModalOpen(false)
	}, [setIsModalOpen])

	const updateMenuLayout = useCallback(() => {
		const anchor = anchorRef?.current
		if (!anchor) return

		const nextLayout = getPrimaryMenuLayout(anchor, primaryPanelRef.current)
		setMenuLayout((currentLayout) =>
			isSameMenuLayout(currentLayout, nextLayout) ? currentLayout : nextLayout,
		)
	}, [anchorRef])

	useEffect(() => {
		if (isModalOpen) {
			setMenuLayout(null)
			setSecondaryPlacement("right")
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
			setSecondaryPlacement("right")
			setMenuLayout(null)
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
		if (!shouldRenderMenu || menuLayout) return
		updateMenuLayout()
	}, [menuLayout, shouldRenderMenu, updateMenuLayout])

	useLayoutEffect(() => {
		if (!shouldRenderMenu || !selectedCategory || !menuLayout) return

		const nextPlacement = getSecondaryPlacement(
			menuLayout,
			primaryPanelRef.current,
			secondaryPanelRef.current,
		)
		setSecondaryPlacement((currentPlacement) =>
			currentPlacement === nextPlacement ? currentPlacement : nextPlacement,
		)
	}, [menuLayout, secondaryElementOptions, selectedCategory, shouldRenderMenu])

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
			setSecondaryPlacement("right")
		}
	}

	function handleDelete() {
		closeMenu()
		deleteElement()
	}

	if (!shouldRenderMenu) return null

	const secondaryPanel = selectedCategory && (
		<ElementOptionsPanel
			ref={secondaryPanelRef}
			className={`secondaryElementOptionsPanel secondaryElementOptionsPanel-${secondaryPlacement}`}
			menuTitle={selectedCategory}
		>
			<ElementOptionsList
				hasSearch={secondHasSearch}
				elementOptions={secondaryElementOptions}
				onSelectOption={(selectedElement) => handleSelectOption(selectedElement, selectedCategory)}
			/>
		</ElementOptionsPanel>
	)
	const primaryPanel = (
		<ElementOptionsPanel
			ref={primaryPanelRef}
			hasDelete={hasDelete}
			onDelete={handleDelete}
			menuTitle={menuTitle}
		>
			<ElementOptionsList
				hasSearch={hasSearch}
				elementOptions={elementOptions}
				selectedCategory={selectedCategory}
				onSelectOption={handleSelectCategory}
			/>
		</ElementOptionsPanel>
	)

	return createPortal(
		<div
			ref={modalRef}
			className={`elementOptionsMenuContainer ${
				isModalOpen ? "elementOptionsMenuOpen" : "elementOptionsMenuClosing"
			}`}
			style={{
				left: `${menuLayout?.primaryLeft ?? 0}px`,
				top: `${menuLayout?.top ?? 0}px`,
				visibility: menuLayout ? undefined : "hidden",
			}}
		>
			{primaryPanel}
			{secondaryPanel}
		</div>,
		document.body,
	)
}

const ElementOptionsPanel = forwardRef(function ElementOptionsPanel(
	{ children, hasDelete, onDelete, className = "", menuTitle },
	ref,
) {
	return (
		<div ref={ref} className={`elementListContainer ${className}`}>
			{menuTitle && <div className="elementOptionsMenuTitle">{menuTitle}</div>}
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
})
