import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"
import "./ElementsMenu.css"
import { DetailPanelContent, getElementDetail } from "./DetailPanel"
import MenuList from "./MenuList"
import {
	HIDDEN_PANEL_STYLE,
	getElementAnchorRect,
	getMenuAnchorGap,
	getPrimaryMenuLayout,
	hideNativePopover,
	showNativePopover,
	useAnchoredPanel,
} from "./anchoredPopover"
import {
	MENU_CLOSE_EVENT,
	MENU_OPEN_EVENT,
	MENU_TRANSITION_MS,
} from "./menuEvents"

const PUNCTUATION_CATEGORY_TEXT = "Punctuation"

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
	const detailLayer = useAnchoredPanel({
		isEnabled: isModalOpen,
		menuRef: modalRef,
	})
	const secondaryLayer = useAnchoredPanel({
		isEnabled: isModalOpen,
		menuRef: modalRef,
		onCloseComplete: detailLayer.reset,
	})
	const normalizedElementOptions = useMemo(
		() => normalizeElementMenuOptions(elementOptions),
		[elementOptions],
	)
	const {
		closeMenu,
		menuPanelStyle,
		shouldRenderMenu,
	} = useMenuLifecycle({
		anchorRef,
		detailLayerRef: detailLayer.ref,
		isModalOpen,
		modalRef,
		resetDetailLayer: detailLayer.reset,
		resetSecondaryLayer: secondaryLayer.reset,
		secondaryLayerRef: secondaryLayer.ref,
		setIsModalOpen,
	})
	const activeSecondaryMenu = secondaryLayer.active
	const selectedPrimaryOptionText = getSelectedPrimaryOptionText(activeSecondaryMenu)

	function openSecondaryMenu(nextSecondaryMenu) {
		detailLayer.reset()
		secondaryLayer.open(nextSecondaryMenu)
	}

	function openSubmenuPanel(option, anchorRect) {
		openSecondaryMenu({
			type: "submenu",
			categoryText: option.text,
			elementOptions: option.list,
			anchorRect,
		})
	}

	function openNestedDetailPanel(detailOption, anchorRect, optionText) {
		const detail = getElementDetail(detailOption)
		if (!detail) {
			detailLayer.close()
			return
		}

		if (isSameLayerDetail(detailLayer.active, detailOption, optionText, anchorRect)) {
			return
		}

		detailLayer.open({ element: detailOption, detail, optionText, anchorRect })
	}

	function openPrimaryDetailPanel(detailOption, anchorRect, optionText) {
		const detail = getElementDetail(detailOption)
		if (!detail) {
			secondaryLayer.close()
			return
		}

		if (isSamePrimaryDetail(activeSecondaryMenu, detailOption, optionText)) {
			return
		}

		openSecondaryMenu({
			type: "detail",
			element: detailOption,
			detail,
			optionText,
			anchorRect,
		})
	}

	function selectOption(option, categoryText) {
		onSelect(addCategoryText(option, categoryText))
		closeMenu()
	}

	function handleSelectPrimaryOption(option) {
		const selectableOption = getSelectableOption(option)

		if (selectableOption) {
			selectOption(selectableOption)
		}
	}

	function handleHoverPrimaryOption(option, anchorRect) {
		const detailOption = getDetailOption(option)

		if (optionOpensSubmenu(option)) {
			if (!isActiveSubmenu(activeSecondaryMenu, option.text)) {
				openSubmenuPanel(option, anchorRect)
			}
			return
		}

		openPrimaryDetailPanel(detailOption, anchorRect, option.text)
	}

	function handleHoverSecondaryOption(option, anchorRect) {
		openNestedDetailPanel(getDetailOption(option), anchorRect, option.text)
	}

	function handleDelete() {
		closeMenu()
		deleteElement()
	}

	if (!shouldRenderMenu) return null

	return createPortal(
		<>
			<PrimaryMenuLayer
				layerRef={modalRef}
				isOpen={isModalOpen}
				style={menuPanelStyle || HIDDEN_PANEL_STYLE}
				hasDelete={hasDelete}
				hasSearch={hasSearch}
				menuTitle={menuTitle}
				elementOptions={normalizedElementOptions}
				selectedOptionText={selectedPrimaryOptionText}
				onDelete={handleDelete}
				onHoverOption={handleHoverPrimaryOption}
				onSelectOption={handleSelectPrimaryOption}
			/>
			<SecondaryMenuLayers
				activeMenu={activeSecondaryMenu}
				isMenuOpen={isModalOpen}
				layers={{ detail: detailLayer, secondary: secondaryLayer }}
				secondHasSearch={secondHasSearch}
				onHoverSecondaryOption={handleHoverSecondaryOption}
				onSelectSecondaryOption={selectOption}
			/>
		</>,
		document.body,
	)
}

function PrimaryMenuLayer({
	isOpen,
	layerRef,
	style,
	hasDelete,
	hasSearch,
	menuTitle,
	elementOptions,
	selectedOptionText,
	onDelete,
	onHoverOption,
	onSelectOption,
}) {
	return (
		<MenuLayer
			layerRef={layerRef}
			className={`elementsMenuContainer ${
				isOpen ? "elementsMenuOpen" : "elementsMenuClosing"
			}`}
			style={style}
		>
			<MenuSurface hasDelete={hasDelete} onDelete={onDelete} menuTitle={menuTitle}>
				<MenuList
					hasSearch={hasSearch}
					elementOptions={elementOptions}
					isOptionClickable={isPrimaryOptionClickable}
					selectedOptionText={selectedOptionText}
					onHoverOption={onHoverOption}
					onSelectOption={onSelectOption}
				/>
			</MenuSurface>
		</MenuLayer>
	)
}

function SecondaryMenuLayers({
	activeMenu,
	isMenuOpen,
	layers,
	secondHasSearch,
	onHoverSecondaryOption,
	onSelectSecondaryOption,
}) {
	if (!activeMenu) return null

	const { detail: detailLayer, secondary: secondaryLayer } = layers

	return (
		<>
			{activeMenu.type === "submenu" && (
				<SubmenuFlyout
					activeMenu={activeMenu}
					detailLayer={detailLayer}
					isMenuOpen={isMenuOpen}
					secondaryLayer={secondaryLayer}
					secondHasSearch={secondHasSearch}
					onHoverSecondaryOption={onHoverSecondaryOption}
					onSelectSecondaryOption={onSelectSecondaryOption}
				/>
			)}
			{activeMenu.type === "detail" && (
				<DetailFlyout
					activeDetail={activeMenu}
					isMenuOpen={isMenuOpen}
					layer={secondaryLayer}
				/>
			)}
			<DetailFlyout
				activeDetail={detailLayer.active}
				isLayer
				isMenuOpen={isMenuOpen}
				layer={detailLayer}
			/>
		</>
	)
}

function SubmenuFlyout({
	activeMenu,
	detailLayer,
	isMenuOpen,
	secondaryLayer,
	secondHasSearch,
	onHoverSecondaryOption,
	onSelectSecondaryOption,
}) {
	const hasSearch =
		activeMenu.categoryText !== PUNCTUATION_CATEGORY_TEXT && secondHasSearch

	return (
		<AnchoredMenuLayer
			isOpen={isMenuOpen}
			layer={secondaryLayer}
			menuType="submenu"
		>
			<MenuSurface menuTitle={activeMenu.categoryText}>
				<MenuList
					hasSearch={hasSearch}
					elementOptions={activeMenu.elementOptions}
					selectedOptionText={detailLayer.active?.optionText}
					onHoverOption={onHoverSecondaryOption}
					onSelectOption={(option) =>
						onSelectSecondaryOption(option, activeMenu.categoryText)
					}
				/>
			</MenuSurface>
		</AnchoredMenuLayer>
	)
}

function DetailFlyout({ activeDetail, isLayer = false, isMenuOpen, layer }) {
	if (!activeDetail) return null

	return (
		<AnchoredMenuLayer
			isOpen={isMenuOpen}
			layer={layer}
			menuType="detail"
			isLayer={isLayer}
		>
			<MenuSurface>
				<DetailPanelContent
					detail={activeDetail.detail}
					element={activeDetail.element}
				/>
			</MenuSurface>
		</AnchoredMenuLayer>
	)
}

function AnchoredMenuLayer({
	children,
	isLayer = false,
	isOpen,
	layer,
	menuType,
}) {
	return (
		<MenuLayer
			layerRef={layer.ref}
			className={getMenuLayerClassName({
				placement: layer.placement,
				type: menuType,
				isLayer,
				isOpen,
			})}
			style={layer.style || HIDDEN_PANEL_STYLE}
		>
			{children}
		</MenuLayer>
	)
}

function MenuLayer({
	children,
	className,
	layerRef,
	style,
}) {
	return (
		<div
			ref={layerRef}
			className={className}
			popover="manual"
			style={style || HIDDEN_PANEL_STYLE}
		>
			{children}
		</div>
	)
}

function MenuSurface({
	children,
	hasDelete,
	onDelete,
	menuTitle,
}) {
	return (
		<div className="menuPanel">
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

function useMenuLifecycle({
	anchorRef,
	detailLayerRef,
	isModalOpen,
	modalRef,
	resetDetailLayer,
	resetSecondaryLayer,
	secondaryLayerRef,
	setIsModalOpen,
}) {
	const menuIdRef = useRef(Symbol("elements-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [menuAnchorRect, setMenuAnchorRect] = useState()
	const [menuPanelStyle, setMenuPanelStyle] = useState()

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
			resetDetailLayer()
			resetSecondaryLayer()
			hideNativePopover(modalRef.current)
			setShouldRenderMenu(false)
			setMenuAnchorRect(undefined)
			setMenuPanelStyle(undefined)
		}, MENU_TRANSITION_MS)

		return () => clearTimeout(timeout)
	}, [anchorRef, isModalOpen, modalRef, resetDetailLayer, resetSecondaryLayer])

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
	}, [isModalOpen, menuAnchorRect, modalRef, shouldRenderMenu])

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
			if (secondaryLayerRef.current?.contains(e.target)) return
			if (detailLayerRef.current?.contains(e.target)) return

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
	}, [anchorRef, closeMenu, detailLayerRef, isModalOpen, modalRef, secondaryLayerRef])

	return {
		closeMenu,
		menuPanelStyle,
		shouldRenderMenu,
	}
}

function isSameLayerDetail(activeDetail, detailOption, optionText, anchorRect) {
	return (
		activeDetail?.element === detailOption &&
		activeDetail.optionText === optionText &&
		activeDetail.anchorRect === anchorRect
	)
}

function isSamePrimaryDetail(activeSecondaryMenu, detailOption, optionText) {
	return (
		activeSecondaryMenu?.type === "detail" &&
		activeSecondaryMenu.element === detailOption &&
		activeSecondaryMenu.optionText === optionText
	)
}

function getSelectedPrimaryOptionText(activeSecondaryMenu) {
	if (activeSecondaryMenu?.type === "detail") return activeSecondaryMenu.optionText
	if (activeSecondaryMenu?.type === "submenu") return activeSecondaryMenu.categoryText
	return undefined
}

function isActiveSubmenu(activeSecondaryMenu, categoryText) {
	return (
		activeSecondaryMenu?.type === "submenu" &&
		activeSecondaryMenu.categoryText === categoryText
	)
}

function addCategoryText(option, categoryText) {
	if (!categoryText) return option

	return {
		...option,
		selectedCategoryText: categoryText,
	}
}

function isPrimaryOptionClickable(option) {
	return !optionOpensSubmenu(option)
}

function normalizeElementMenuOptions(elementOptions = []) {
	return elementOptions.map(normalizeElementMenuOption)
}

function getSelectableOption(option) {
	if (!option) return null
	if (option.selectOption) return option.selectOption
	if (!option.list) return option
	return null
}

function getDetailOption(option) {
	return getSelectableOption(option) || option
}

function optionOpensSubmenu(option) {
	return Array.isArray(option?.list) && !getSelectableOption(option)
}

function normalizeElementMenuOption(option) {
	if (!option || typeof option !== "object") return option

	const normalizedOption = {
		...option,
	}

	if (Array.isArray(option.list)) {
		normalizedOption.list = option.list.map(normalizeElementMenuOption)
	}

	if (!normalizedOption.selectOption && hasImplicitDirectSelectOption(normalizedOption)) {
		// Older menu data used a one-item child list to mean "select this child
		// directly". Normalize that shape once so the click/hover handlers can
		// read the intent without repeating list-length checks.
		normalizedOption.selectOption = normalizedOption.list[0]
	}

	return normalizedOption
}

function hasImplicitDirectSelectOption(option) {
	return option.list?.length === 1 && option.list[0]?.text === option.text
}

function getMenuLayerClassName({ placement, type, isLayer = false, isOpen }) {
	return joinClassNames(
		"flyoutMenuPanel",
		isOpen ? "flyoutMenuPanelOpen" : "flyoutMenuPanelClosing",
		isLayer && "flyoutMenuPanel-layer",
		`flyoutMenuPanel-${placement}`,
		type === "submenu" && "flyoutMenuPanel-submenu",
		type === "detail" && "flyoutMenuPanel-detail",
	)
}

function joinClassNames(...classNames) {
	return classNames.filter(Boolean).join(" ")
}
