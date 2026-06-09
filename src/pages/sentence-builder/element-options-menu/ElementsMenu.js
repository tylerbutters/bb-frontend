import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./ElementsMenu.css"
import { ElementDetailPanelContent, getElementDetail } from "./ElementDetailPanel"
import MenuList from "./MenuList"
import { MENU_CLOSE_EVENT, MENU_OPEN_EVENT, MENU_TRANSITION_MS } from "./elementsMenuConstants"

const MENU_VIEWPORT_PADDING = 16

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
	const flyoutPanelRef = useRef(null)
	const detailLayerPanelRef = useRef(null)
	const flyoutCloseTimeoutRef = useRef(null)
	const detailLayerCloseTimeoutRef = useRef(null)
	const menuIdRef = useRef(Symbol("elements-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [menuAnchorRect, setMenuAnchorRect] = useState()
	const [menuPanelStyle, setMenuPanelStyle] = useState()
	const [activeFlyout, setActiveFlyout] = useState(null)
	const [isFlyoutPanelOpen, setIsFlyoutPanelOpen] = useState(false)
	const [flyoutPlacement, setFlyoutPlacement] = useState("right")
	const [flyoutPanelStyle, setFlyoutPanelStyle] = useState()
	const [activeDetailLayer, setActiveDetailLayer] = useState(null)
	const [isDetailLayerOpen, setIsDetailLayerOpen] = useState(false)
	const [detailLayerPlacement, setDetailLayerPlacement] = useState("right")
	const [detailLayerStyle, setDetailLayerStyle] = useState()
	const selectedCategory =
		activeFlyout?.type === "submenu" ? activeFlyout.categoryText : undefined

	const closeMenu = useCallback(() => {
		setIsModalOpen(false)
	}, [setIsModalOpen])

	useEffect(() => {
		if (isModalOpen) {
			setMenuAnchorRect(getElementAnchorRect(anchorRef?.current))
			setMenuPanelStyle(undefined)
			setShouldRenderMenu(true)
			window.dispatchEvent(
				new CustomEvent(MENU_OPEN_EVENT, {
					detail: menuIdRef.current,
				}),
			)
			return
		}

		const timeout = setTimeout(() => {
			clearFlyoutCloseTimeout()
			clearDetailLayerCloseTimeout()

			hideNativePopover(detailLayerPanelRef.current)
			hideNativePopover(flyoutPanelRef.current)
			hideNativePopover(modalRef.current)
			setShouldRenderMenu(false)
			setMenuAnchorRect(undefined)
			setMenuPanelStyle(undefined)
			resetFlyoutPanel()
			resetDetailLayerPanel()
		}, MENU_TRANSITION_MS)

		return () => clearTimeout(timeout)
	}, [anchorRef, isModalOpen])

	useEffect(() => {
		return () => {
			clearFlyoutCloseTimeout()
			clearDetailLayerCloseTimeout()
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
			if (flyoutPanelRef.current?.contains(e.target)) return
			if (detailLayerPanelRef.current?.contains(e.target)) return

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
		if (!shouldRenderMenu || !isModalOpen || !menuAnchorRect) return

		const menu = modalRef.current
		if (!menu) return

		showNativePopover(menu)

		const menuRect = menu.getBoundingClientRect()
		const style = getPrimaryMenuLayout(menuAnchorRect, menuRect, getMenuAnchorGap(menu))

		setMenuPanelStyle((currentStyle) => {
			if (currentStyle?.left === style.left && currentStyle?.top === style.top) {
				return currentStyle
			}

			return style
		})
	}, [isModalOpen, menuAnchorRect, shouldRenderMenu])

	useLayoutEffect(() => {
		if (!shouldRenderMenu || !activeFlyout || !isFlyoutPanelOpen || !isModalOpen) {
			return
		}

		const flyoutPanel = flyoutPanelRef.current
		const menu = modalRef.current
		const anchorRect = activeFlyout.anchorRect
		if (!flyoutPanel || !menu || !anchorRect) return

		showNativePopover(flyoutPanel)

		const flyoutRect = flyoutPanel.getBoundingClientRect()
		const { placement, style } = getAnchoredPanelLayout(
			anchorRect,
			flyoutRect,
			getMenuPanelGap(menu),
		)

		setFlyoutPlacement((currentPlacement) =>
			currentPlacement === placement ? currentPlacement : placement,
		)
		setFlyoutPanelStyle((currentStyle) => {
			if (currentStyle?.left === style.left && currentStyle?.top === style.top) {
				return currentStyle
			}

			return style
		})
	}, [activeFlyout, isFlyoutPanelOpen, isModalOpen, shouldRenderMenu])

	useLayoutEffect(() => {
		if (!shouldRenderMenu || !activeDetailLayer || !isDetailLayerOpen || !isModalOpen) {
			return
		}

		const detailLayerPanel = detailLayerPanelRef.current
		const menu = modalRef.current
		const anchorRect = activeDetailLayer.anchorRect
		if (!detailLayerPanel || !menu || !anchorRect) return

		showNativePopover(detailLayerPanel)

		const detailLayerRect = detailLayerPanel.getBoundingClientRect()
		const { placement, style } = getAnchoredPanelLayout(
			anchorRect,
			detailLayerRect,
			getMenuPanelGap(menu),
		)

		setDetailLayerPlacement((currentPlacement) =>
			currentPlacement === placement ? currentPlacement : placement,
		)
		setDetailLayerStyle((currentStyle) => {
			if (currentStyle?.left === style.left && currentStyle?.top === style.top) {
				return currentStyle
			}

			return style
		})
	}, [activeDetailLayer, isDetailLayerOpen, isModalOpen, shouldRenderMenu])

	function clearFlyoutCloseTimeout() {
		if (!flyoutCloseTimeoutRef.current) return

		clearTimeout(flyoutCloseTimeoutRef.current)
		flyoutCloseTimeoutRef.current = null
	}

	function clearDetailLayerCloseTimeout() {
		if (!detailLayerCloseTimeoutRef.current) return

		clearTimeout(detailLayerCloseTimeoutRef.current)
		detailLayerCloseTimeoutRef.current = null
	}

	function resetFlyoutPanel() {
		setActiveFlyout(null)
		setIsFlyoutPanelOpen(false)
		setFlyoutPlacement("right")
		setFlyoutPanelStyle(undefined)
	}

	function resetDetailLayerPanel() {
		setActiveDetailLayer(null)
		setIsDetailLayerOpen(false)
		setDetailLayerPlacement("right")
		setDetailLayerStyle(undefined)
	}

	function finishFlyoutPanelClose() {
		clearFlyoutCloseTimeout()
		hideNativePopover(detailLayerPanelRef.current)
		hideNativePopover(flyoutPanelRef.current)
		resetDetailLayerPanel()
		resetFlyoutPanel()
	}

	function closeFlyoutPanel() {
		clearFlyoutCloseTimeout()
		setIsFlyoutPanelOpen(false)
		flyoutCloseTimeoutRef.current = setTimeout(finishFlyoutPanelClose, MENU_TRANSITION_MS)
	}

	function openFlyoutPanel(nextFlyout) {
		clearFlyoutCloseTimeout()
		clearDetailLayerCloseTimeout()
		hideNativePopover(detailLayerPanelRef.current)
		resetDetailLayerPanel()
		setActiveFlyout(nextFlyout)
		setFlyoutPlacement("right")
		setFlyoutPanelStyle(undefined)
		setIsFlyoutPanelOpen(true)
	}

	function openSubmenuPanel(selectedElement, anchorRect) {
		openFlyoutPanel({
			type: "submenu",
			categoryText: selectedElement.text,
			elementOptions: selectedElement.list,
			anchorRect,
		})
	}

	function finishDetailLayerClose() {
		clearDetailLayerCloseTimeout()
		hideNativePopover(detailLayerPanelRef.current)
		resetDetailLayerPanel()
	}

	function closeDetailLayerPanel() {
		if (!activeDetailLayer) return

		clearDetailLayerCloseTimeout()
		setIsDetailLayerOpen(false)
		detailLayerCloseTimeoutRef.current = setTimeout(
			finishDetailLayerClose,
			MENU_TRANSITION_MS,
		)
	}

	function openDetailLayerPanel(element, anchorRect) {
		if (!getElementDetail(element)) {
			closeDetailLayerPanel()
			return
		}

		if (
			activeDetailLayer?.element === element &&
			activeDetailLayer.anchorRect === anchorRect &&
			isDetailLayerOpen
		) {
			return
		}

		clearDetailLayerCloseTimeout()
		setActiveDetailLayer({ element, anchorRect })
		setDetailLayerPlacement("right")
		setDetailLayerStyle(undefined)
		setIsDetailLayerOpen(true)
	}

	function closeActiveDetail(source) {
		if (activeFlyout?.type !== "detail") return
		if (source && activeFlyout.source !== source) return

		closeFlyoutPanel()
	}

	function openDetailPanel(element, source, categoryText, anchorRect) {
		openFlyoutPanel({
			type: "detail",
			element,
			source,
			categoryText,
			anchorRect,
		})
	}

	function showActiveDetail(element, source, categoryText, anchorRect) {
		if (!getElementDetail(element)) {
			closeActiveFlyout(source)
			return
		}

		if (
			activeFlyout?.type === "detail" &&
			activeFlyout.element === element &&
			activeFlyout.source === source &&
			isFlyoutPanelOpen
		) {
			return
		}

		openDetailPanel(element, source, categoryText, anchorRect)
	}

	function clearActiveDetail(source) {
		closeActiveDetail(source)
	}

	function handleLeaveOptions(source) {
		if (source === "secondary") {
			closeDetailLayerPanel()
			return
		}

		clearActiveDetail(source)
	}

	function closeActiveFlyout(source) {
		if (!activeFlyout) return
		if (source && activeFlyout?.source && activeFlyout.source !== source) return
		if (source === "secondary" && activeFlyout?.type !== "detail") return

		closeFlyoutPanel()
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

	function handleSelectCategory(selectedElement, anchorRect) {
		const directOption = getDirectSelectOption(selectedElement)

		if (directOption) {
			handleSelectOption(directOption)
		} else {
			if (selectedCategory === selectedElement.text) {
				closeFlyoutPanel()
				return
			}

			openSubmenuPanel(selectedElement, anchorRect)
		}
	}

	function optionOpensSubmenu(element) {
		return Array.isArray(element?.list) && !getDirectSelectOption(element)
	}

	function handleHoverOption(element, source, categoryText, anchorRect) {
		const detailElement = getDirectSelectOption(element) || element

		if (source === "secondary") {
			openDetailLayerPanel(detailElement, anchorRect)
			return
		}

		if (source === "primary" && optionOpensSubmenu(element)) {
			if (selectedCategory !== element.text) {
				openSubmenuPanel(element, anchorRect)
			}
			return
		}

		showActiveDetail(detailElement, source, categoryText, anchorRect)
	}

	function handleLeaveOption(element, source) {
		if (source === "secondary") closeDetailLayerPanel()
	}

	function handleDelete() {
		closeMenu()
		deleteElement()
	}

	if (!shouldRenderMenu) return null

	const flyoutPanel = activeFlyout && (
		<MenuPanel
			panelRef={flyoutPanelRef}
			className={[
				"flyoutMenuPanel",
				`flyoutMenuPanel-${flyoutPlacement}`,
				activeFlyout.type === "submenu" ? "flyoutMenuPanel-submenu" : "",
				activeFlyout.type === "detail" ? "flyoutMenuPanel-detail" : "",
				isFlyoutPanelOpen ? "flyoutMenuPanelOpen" : "flyoutMenuPanelClosing",
			]
				.filter(Boolean)
				.join(" ")}
			menuTitle={activeFlyout.type === "submenu" ? activeFlyout.categoryText : undefined}
			popover="manual"
			style={flyoutPanelStyle || { left: 0, top: 0, visibility: "hidden" }}
		>
			{activeFlyout.type === "submenu" && (
				<MenuList
					hasSearch={selectedCategory === "Punctuation" ? false : secondHasSearch}
					elementOptions={activeFlyout.elementOptions}
					categoryText={activeFlyout.categoryText}
					detailSource="secondary"
					onHoverOption={handleHoverOption}
					onLeaveOption={handleLeaveOption}
					onLeaveOptions={handleLeaveOptions}
					onSelectOption={(selectedElement) =>
						handleSelectOption(selectedElement, activeFlyout.categoryText)
					}
				/>
			)}
			{activeFlyout.type === "detail" && (
				<ElementDetailPanelContent element={activeFlyout.element} />
			)}
		</MenuPanel>
	)
	const detailLayerPanel = activeDetailLayer && (
		<MenuPanel
			panelRef={detailLayerPanelRef}
			className={[
				"flyoutMenuPanel",
				"flyoutMenuPanel-layer",
				`flyoutMenuPanel-${detailLayerPlacement}`,
				"flyoutMenuPanel-detail",
				isDetailLayerOpen ? "flyoutMenuPanelOpen" : "flyoutMenuPanelClosing",
			]
				.filter(Boolean)
				.join(" ")}
			popover="manual"
			style={detailLayerStyle || { left: 0, top: 0, visibility: "hidden" }}
		>
			<ElementDetailPanelContent element={activeDetailLayer.element} />
		</MenuPanel>
	)
	const primaryPanel = (
		<MenuPanel hasDelete={hasDelete} onDelete={handleDelete} menuTitle={menuTitle}>
			<MenuList
				hasSearch={hasSearch}
				elementOptions={elementOptions}
				categoryText={selectedCategory}
				selectedOptionText={selectedCategory}
				detailSource="primary"
				onHoverOption={handleHoverOption}
				onLeaveOption={handleLeaveOption}
				onLeaveOptions={handleLeaveOptions}
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
				style={menuPanelStyle || { left: 0, top: 0, visibility: "hidden" }}
			>
				{primaryPanel}
			</div>
			{flyoutPanel}
			{detailLayerPanel}
		</>,
		document.body,
	)
}

function MenuPanel({
	children,
	hasDelete,
	onDelete,
	className = "",
	menuTitle,
	panelRef,
	popover,
	style,
}) {
	return (
		<div ref={panelRef} className={`menuPanel ${className}`} popover={popover} style={style}>
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

function getElementAnchorRect(element) {
	const rect = element?.getBoundingClientRect?.()

	if (!rect) return null

	return {
		top: rect.top,
		right: rect.right,
		bottom: rect.bottom,
		left: rect.left,
		width: rect.width,
		height: rect.height,
	}
}

function getDirectSelectOption(element) {
	if (!element?.list) return element

	if (element.list.length === 1 && element.list[0].text === element.text) {
		return element.list[0]
	}

	return null
}

function getMenuAnchorGap(menu) {
	const styles = window.getComputedStyle(menu)
	return parseFloat(styles.getPropertyValue("--element-options-anchor-gap")) || 0
}

function getMenuPanelGap(menu) {
	const styles = window.getComputedStyle(menu)
	return parseFloat(styles.getPropertyValue("--element-options-panel-gap")) || 0
}

function getPrimaryMenuLayout(anchorRect, menuRect, anchorGap) {
	const maxLeft = window.innerWidth - menuRect.width - MENU_VIEWPORT_PADDING
	const maxTop = window.innerHeight - menuRect.height - MENU_VIEWPORT_PADDING
	const anchorCenter = anchorRect.left + anchorRect.width / 2
	const belowTop = anchorRect.bottom + anchorGap
	const aboveTop = anchorRect.top - menuRect.height - anchorGap
	const top = aboveTop >= MENU_VIEWPORT_PADDING ? aboveTop : belowTop
	const left = anchorCenter - menuRect.width / 2

	return {
		left: Math.max(MENU_VIEWPORT_PADDING, Math.min(left, maxLeft)),
		top: Math.max(MENU_VIEWPORT_PADDING, Math.min(top, maxTop)),
	}
}

function getAnchoredPanelLayout(anchorRect, panelRect, panelGap) {
	const maxLeft = window.innerWidth - panelRect.width - MENU_VIEWPORT_PADDING
	const maxTop = window.innerHeight - panelRect.height - MENU_VIEWPORT_PADDING
	const rightSideLeft = anchorRect.right + panelGap
	const leftSideLeft = anchorRect.left - panelRect.width - panelGap
	let left = rightSideLeft
	let placement = "right"

	if (left > maxLeft) {
		left = leftSideLeft
		placement = "left"
	}

	return {
		placement,
		style: {
			left: Math.max(MENU_VIEWPORT_PADDING, Math.min(left, maxLeft)),
			top: Math.max(MENU_VIEWPORT_PADDING, Math.min(anchorRect.top, maxTop)),
		},
	}
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
