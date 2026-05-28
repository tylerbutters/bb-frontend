import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./ElementOptionsMenu.css"
import ElementOptionsList from "./ElementOptionsList"
import {
	MENU_CLOSE_EVENT,
	MENU_OPEN_EVENT,
	MENU_TRANSITION_MS,
} from "./elementOptionsMenuConstants"

const MENU_VIEWPORT_PADDING = 16

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
	const secondaryPanelRef = useRef(null)
	const secondaryCloseTimeoutRef = useRef(null)
	const menuIdRef = useRef(Symbol("element-options-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [shouldRenderSecondaryPanel, setShouldRenderSecondaryPanel] = useState(false)
	const [isSecondaryPanelOpen, setIsSecondaryPanelOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])
	const [secondaryPlacement, setSecondaryPlacement] = useState("right")

	const closeMenu = useCallback(() => {
		setIsModalOpen(false)
	}, [setIsModalOpen])

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
			if (secondaryCloseTimeoutRef.current) {
				clearTimeout(secondaryCloseTimeoutRef.current)
				secondaryCloseTimeoutRef.current = null
			}

			hideNativePopover(modalRef.current)
			setShouldRenderMenu(false)
			setShouldRenderSecondaryPanel(false)
			setIsSecondaryPanelOpen(false)
			setSelectedCategory(null)
			setSecondaryElementOptions([])
			setSecondaryPlacement("right")
		}, MENU_TRANSITION_MS)

		return () => clearTimeout(timeout)
	}, [isModalOpen])

	useEffect(() => {
		return () => {
			if (secondaryCloseTimeoutRef.current) {
				clearTimeout(secondaryCloseTimeoutRef.current)
			}
		}
	}, [])

	useEffect(() => {
		function handleOtherMenuOpen(e) {
			if (e.detail === menuIdRef.current) return
			closeMenu()
		}

		window.addEventListener(MENU_OPEN_EVENT, handleOtherMenuOpen)
		window.addEventListener(MENU_CLOSE_EVENT, closeMenu)

		return () => {
			window.removeEventListener(MENU_OPEN_EVENT, handleOtherMenuOpen)
			window.removeEventListener(MENU_CLOSE_EVENT, closeMenu)
		}
	}, [closeMenu])

	useEffect(() => {
		if (!isModalOpen) return undefined

		function handlePointerDown(e) {
			if (anchorRef?.current?.contains(e.target)) return
			if (modalRef.current?.contains(e.target)) return

			closeMenu()
		}

		function handleKeyDown(e) {
			if (e.key === "Escape") {
				closeMenu()
			}
		}

		document.addEventListener("mousedown", handlePointerDown)
		document.addEventListener("keydown", handleKeyDown)

		return () => {
			document.removeEventListener("mousedown", handlePointerDown)
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [anchorRef, closeMenu, isModalOpen])

	useLayoutEffect(() => {
		if (!shouldRenderMenu || !isModalOpen) return
		showNativePopover(modalRef.current, anchorRef?.current)
	}, [anchorRef, isModalOpen, shouldRenderMenu])

	useLayoutEffect(() => {
		if (
			!shouldRenderMenu ||
			!shouldRenderSecondaryPanel ||
			!isSecondaryPanelOpen ||
			!isModalOpen
		) {
			return
		}

		const menu = modalRef.current
		const secondaryPanel = secondaryPanelRef.current
		if (!menu || !secondaryPanel) return

		const menuRect = menu.getBoundingClientRect()
		const secondaryRect = secondaryPanel.getBoundingClientRect()
		const styles = window.getComputedStyle(menu)
		const panelGap = parseFloat(styles.getPropertyValue("--element-options-panel-gap")) || 0
		const rightEdge = menuRect.right + panelGap + secondaryRect.width
		const nextPlacement =
			rightEdge > window.innerWidth - MENU_VIEWPORT_PADDING ? "left" : "right"

		setSecondaryPlacement((currentPlacement) =>
			currentPlacement === nextPlacement ? currentPlacement : nextPlacement,
		)
	}, [
		isModalOpen,
		isSecondaryPanelOpen,
		secondaryElementOptions,
		shouldRenderMenu,
		shouldRenderSecondaryPanel,
	])

	function closeSecondaryPanel() {
		if (secondaryCloseTimeoutRef.current) {
			clearTimeout(secondaryCloseTimeoutRef.current)
		}

		setIsSecondaryPanelOpen(false)
		secondaryCloseTimeoutRef.current = setTimeout(
			finishSecondaryPanelClose,
			MENU_TRANSITION_MS,
		)
	}

	function openSecondaryPanel(selectedElement) {
		if (secondaryCloseTimeoutRef.current) {
			clearTimeout(secondaryCloseTimeoutRef.current)
			secondaryCloseTimeoutRef.current = null
		}

		setSelectedCategory(selectedElement.text)
		setSecondaryElementOptions(selectedElement.list)
		setSecondaryPlacement("right")
		setShouldRenderSecondaryPanel(true)
		setIsSecondaryPanelOpen(true)
	}

	function finishSecondaryPanelClose() {
		if (secondaryCloseTimeoutRef.current) {
			clearTimeout(secondaryCloseTimeoutRef.current)
			secondaryCloseTimeoutRef.current = null
		}

		setShouldRenderSecondaryPanel(false)
		setSelectedCategory(null)
		setSecondaryElementOptions([])
		setSecondaryPlacement("right")
	}

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
			if (selectedCategory === selectedElement.text) {
				closeSecondaryPanel()
				return
			}

			openSecondaryPanel(selectedElement)
		}
	}

	function handleDelete() {
		closeMenu()
		deleteElement()
	}

	if (!shouldRenderMenu) return null

	const secondaryPanel = shouldRenderSecondaryPanel && (
		<ElementOptionsPanel
			panelRef={secondaryPanelRef}
			className={`secondaryElementOptionsPanel secondaryElementOptionsPanel-${secondaryPlacement} ${
				isSecondaryPanelOpen
					? "secondaryElementOptionsPanelOpen"
					: "secondaryElementOptionsPanelClosing"
			}`}
			menuTitle={selectedCategory}
		>
			<ElementOptionsList
				hasSearch={selectedCategory === "Punctuation" ? false : secondHasSearch}
				elementOptions={secondaryElementOptions}
				onSelectOption={(selectedElement) => handleSelectOption(selectedElement, selectedCategory)}
			/>
		</ElementOptionsPanel>
	)
	const primaryPanel = (
		<ElementOptionsPanel
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
			popover="manual"
			className={`elementOptionsMenuContainer ${
				isModalOpen ? "elementOptionsMenuOpen" : "elementOptionsMenuClosing"
			}`}
		>
			{primaryPanel}
			{secondaryPanel}
		</div>,
		document.body,
	)
}

function ElementOptionsPanel({
	children,
	hasDelete,
	onDelete,
	className = "",
	menuTitle,
	panelRef,
}) {
	return (
		<div ref={panelRef} className={`elementListContainer ${className}`}>
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
}

function isNativePopoverSupported(element) {
	return Boolean(element?.showPopover && element?.hidePopover)
}

function isNativePopoverOpen(element) {
	try {
		return Boolean(element?.matches?.(":popover-open"))
	} catch {
		return false
	}
}

function showNativePopover(element, source) {
	if (!isNativePopoverSupported(element) || isNativePopoverOpen(element)) return

	if (source) {
		try {
			element.showPopover({ source })
			return
		} catch {
			// Fall through for browsers that support popovers without the source option.
		}
	}

	try {
		element.showPopover()
	} catch {
		// React state still controls whether the menu is rendered.
	}
}

function hideNativePopover(element) {
	if (!isNativePopoverSupported(element) || !isNativePopoverOpen(element)) return

	try {
		element.hidePopover()
	} catch {
		// The element may already be hidden or unmounted.
	}
}
