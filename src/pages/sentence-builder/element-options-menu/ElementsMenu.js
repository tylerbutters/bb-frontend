import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./ElementsMenu.css"
import ElementDetailPanel, { getElementDetail } from "./ElementDetailPanel"
import MenuList from "./MenuList"
import { MENU_CLOSE_EVENT, MENU_OPEN_EVENT, MENU_TRANSITION_MS } from "./elementsMenuConstants"

const MENU_VIEWPORT_PADDING = 16
const DETAIL_HOVER_DELAY_MS = 500
const DETAIL_TRANSITION_MS = 160

export default function ElementsMenu({
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
	const detailPanelRef = useRef(null)
	const detailHoverTimeoutRef = useRef(null)
	const detailHoverSourceRef = useRef(null)
	const detailCloseTimeoutRef = useRef(null)
	const secondaryCloseTimeoutRef = useRef(null)
	const menuIdRef = useRef(Symbol("elements-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [shouldRenderSecondaryPanel, setShouldRenderSecondaryPanel] = useState(false)
	const [isSecondaryPanelOpen, setIsSecondaryPanelOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])
	const [secondaryPlacement, setSecondaryPlacement] = useState("right")
	const [shouldRenderDetailPanel, setShouldRenderDetailPanel] = useState(false)
	const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
	const [activeDetail, setActiveDetail] = useState(null)
	const [detailPanelStyle, setDetailPanelStyle] = useState()

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
			clearDetailHoverTimeout()
			clearDetailCloseTimeout()

			hideNativePopover(detailPanelRef.current)
			hideNativePopover(modalRef.current)
			setShouldRenderMenu(false)
			setShouldRenderSecondaryPanel(false)
			setIsSecondaryPanelOpen(false)
			setSelectedCategory(null)
			setSecondaryElementOptions([])
			setSecondaryPlacement("right")
			setShouldRenderDetailPanel(false)
			setIsDetailPanelOpen(false)
			setActiveDetail(null)
			setDetailPanelStyle(undefined)
		}, MENU_TRANSITION_MS)

		return () => clearTimeout(timeout)
	}, [isModalOpen])

	useEffect(() => {
		return () => {
			if (secondaryCloseTimeoutRef.current) {
				clearTimeout(secondaryCloseTimeoutRef.current)
			}
			clearDetailHoverTimeout()
			clearDetailCloseTimeout()
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
			if (detailPanelRef.current?.contains(e.target)) return

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
		if (!shouldRenderMenu || !shouldRenderSecondaryPanel || !isSecondaryPanelOpen || !isModalOpen) {
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
		const nextPlacement = rightEdge > window.innerWidth - MENU_VIEWPORT_PADDING ? "left" : "right"

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

	useLayoutEffect(() => {
		if (!shouldRenderDetailPanel || !activeDetail || !isModalOpen || !shouldRenderMenu) {
			return
		}

		const detailPanel = detailPanelRef.current
		const menu = modalRef.current
		const anchorRect = activeDetail.anchorRect
		if (!detailPanel || !menu || !anchorRect) return

		showNativePopover(detailPanel)

		const detailRect = detailPanel.getBoundingClientRect()
		const styles = window.getComputedStyle(menu)
		const panelGap = parseFloat(styles.getPropertyValue("--element-options-panel-gap")) || 0
		const maxLeft = window.innerWidth - detailRect.width - MENU_VIEWPORT_PADDING
		const maxTop = window.innerHeight - detailRect.height - MENU_VIEWPORT_PADDING
		const rightSideLeft = anchorRect.right + panelGap
		const leftSideLeft = anchorRect.left - detailRect.width - panelGap
		let left = rightSideLeft

		if (left > maxLeft) {
			left = leftSideLeft
		}

		left = Math.max(MENU_VIEWPORT_PADDING, Math.min(left, maxLeft))
		const top = Math.max(MENU_VIEWPORT_PADDING, Math.min(anchorRect.top, maxTop))

		setDetailPanelStyle((currentStyle) => {
			if (currentStyle?.left === left && currentStyle?.top === top) {
				return currentStyle
			}

			return { left, top }
		})
	}, [
		activeDetail,
		isModalOpen,
		secondaryPlacement,
		shouldRenderDetailPanel,
		shouldRenderMenu,
		shouldRenderSecondaryPanel,
	])

	function closeSecondaryPanel() {
		if (secondaryCloseTimeoutRef.current) {
			clearTimeout(secondaryCloseTimeoutRef.current)
		}

		setIsSecondaryPanelOpen(false)
		secondaryCloseTimeoutRef.current = setTimeout(finishSecondaryPanelClose, MENU_TRANSITION_MS)
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
		clearActiveDetail("secondary")
	}

	function clearDetailHoverTimeout(source) {
		if (!detailHoverTimeoutRef.current) return
		if (source && detailHoverSourceRef.current !== source) return

		clearTimeout(detailHoverTimeoutRef.current)
		detailHoverTimeoutRef.current = null
		detailHoverSourceRef.current = null
	}

	function clearDetailCloseTimeout() {
		if (!detailCloseTimeoutRef.current) return

		clearTimeout(detailCloseTimeoutRef.current)
		detailCloseTimeoutRef.current = null
	}

	function finishDetailPanelClose() {
		hideNativePopover(detailPanelRef.current)
		setShouldRenderDetailPanel(false)
		setIsDetailPanelOpen(false)
		setActiveDetail(null)
		setDetailPanelStyle(undefined)
	}

	function closeActiveDetail(source) {
		clearDetailHoverTimeout(source)

		if (!activeDetail) return
		if (source && activeDetail.source !== source) return

		clearDetailCloseTimeout()
		setIsDetailPanelOpen(false)
		detailCloseTimeoutRef.current = setTimeout(finishDetailPanelClose, DETAIL_TRANSITION_MS)
	}

	function showActiveDetail(element, source, categoryText, anchorRect) {
		if (!getElementDetail(element)) {
			closeActiveDetail(source)
			return
		}

		if (activeDetail?.element === element && activeDetail?.source === source && isDetailPanelOpen) {
			return
		}

		clearDetailHoverTimeout()
		closeActiveDetail()
		detailHoverSourceRef.current = source
		detailHoverTimeoutRef.current = setTimeout(() => {
			clearDetailCloseTimeout()
			detailHoverTimeoutRef.current = null
			detailHoverSourceRef.current = null
			setActiveDetail({
				element,
				source,
				categoryText,
				anchorRect,
			})
			setDetailPanelStyle(undefined)
			setShouldRenderDetailPanel(true)
			setIsDetailPanelOpen(true)
		}, DETAIL_HOVER_DELAY_MS)
	}

	function clearActiveDetail(source) {
		closeActiveDetail(source)
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
		<MenuPanel
			panelRef={secondaryPanelRef}
			className={`secondaryMenuPanel secondaryMenuPanel-${secondaryPlacement} ${
				isSecondaryPanelOpen ? "secondaryMenuPanelOpen" : "secondaryMenuPanelClosing"
			}`}
			menuTitle={selectedCategory}
		>
			<MenuList
				hasSearch={selectedCategory === "Punctuation" ? false : secondHasSearch}
				elementOptions={secondaryElementOptions}
				selectedCategory={selectedCategory}
				detailSource="secondary"
				onHoverOption={showActiveDetail}
				onLeaveOptions={clearActiveDetail}
				onSelectOption={(selectedElement) => handleSelectOption(selectedElement, selectedCategory)}
			/>
		</MenuPanel>
	)
	const primaryPanel = (
		<MenuPanel hasDelete={hasDelete} onDelete={handleDelete} menuTitle={menuTitle}>
			<MenuList
				hasSearch={hasSearch}
				elementOptions={elementOptions}
				selectedCategory={selectedCategory}
				detailSource="primary"
				onHoverOption={showActiveDetail}
				onLeaveOptions={clearActiveDetail}
				onSelectOption={handleSelectCategory}
			/>
		</MenuPanel>
	)

	return createPortal(
		<>
			<div
				ref={modalRef}
				popover="manual"
				className={`elementsMenuContainer ${
					isModalOpen ? "elementsMenuOpen" : "elementsMenuClosing"
				}`}
			>
				{primaryPanel}
				{secondaryPanel}
			</div>
			{shouldRenderDetailPanel && activeDetail && (
				<ElementDetailPanel
					panelRef={detailPanelRef}
					element={activeDetail.element}
					isOpen={isDetailPanelOpen}
					style={detailPanelStyle || { left: 0, top: 0, visibility: "hidden" }}
				/>
			)}
		</>,
		document.body,
	)
}

function MenuPanel({ children, hasDelete, onDelete, className = "", menuTitle, panelRef }) {
	return (
		<div ref={panelRef} className={`menuPanel ${className}`}>
			{menuTitle && <div className="elementsMenuTitle">{menuTitle}</div>}
			{children}
			{hasDelete && (
				<div className="deleteElementButtonContainer">
					<button
						type="button"
						className="elementsMenuButton deleteElementButton"
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
