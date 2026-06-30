import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import type { CSSProperties, ReactNode, RefObject } from "react"
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
import type { AnchorRect, PanelStyle } from "./anchoredPopover"
import type { MenuOption } from "../types"

const PUNCTUATION_CATEGORY_TEXT = "Punctuation"

interface ElementsMenuProps {
	anchorRef: RefObject<HTMLElement | null>
	isModalOpen: boolean
	setIsModalOpen: (isOpen: boolean) => void
	onSelect: (option: MenuOption) => void
	elementOptions?: MenuOption[]
	deleteElement?: () => void
	hasSearch?: boolean
	secondHasSearch?: boolean
	hasDelete?: boolean
	menuTitle?: string
}

interface ActiveMenu {
	type: "submenu" | "detail"
	categoryText?: string
	elementOptions?: MenuOption[]
	element?: MenuOption
	detail?: any
	optionText?: string
	anchorRect?: AnchorRect | null
}

export default function ElementsMenu({
	anchorRef,
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	secondHasSearch = true,
	hasDelete = false,
	menuTitle = "",
}: ElementsMenuProps) {
	const modalRef = useRef<HTMLDivElement | null>(null)
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

	function openSecondaryMenu(nextSecondaryMenu: ActiveMenu) {
		detailLayer.reset()
		secondaryLayer.open(nextSecondaryMenu)
	}

	function openSubmenuPanel(option: MenuOption, anchorRect: AnchorRect) {
		openSecondaryMenu({
			type: "submenu",
			categoryText: option.text,
			elementOptions: option.list,
			anchorRect,
		})
	}

	function openNestedDetailPanel(detailOption: MenuOption, anchorRect: AnchorRect, optionText?: string) {
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

	function openPrimaryDetailPanel(detailOption: MenuOption, anchorRect: AnchorRect, optionText?: string) {
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

	function selectOption(option: MenuOption, categoryText?: string) {
		onSelect(addCategoryText(option, categoryText))
		closeMenu()
	}

	function handleSelectPrimaryOption(option: MenuOption) {
		const selectableOption = getSelectableOption(option)

		if (selectableOption) {
			selectOption(selectableOption)
		}
	}

	function handleHoverPrimaryOption(option: MenuOption, anchorRect: AnchorRect) {
		const detailOption = getDetailOption(option)

		if (optionOpensSubmenu(option)) {
			if (!isActiveSubmenu(activeSecondaryMenu, option.text)) {
				openSubmenuPanel(option, anchorRect)
			}
			return
		}

		openPrimaryDetailPanel(detailOption, anchorRect, option.text)
	}

	function handleHoverSecondaryOption(option: MenuOption, anchorRect: AnchorRect) {
		openNestedDetailPanel(getDetailOption(option), anchorRect, option.text)
	}

	function handleDelete() {
		closeMenu()
		deleteElement?.()
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
}: any) {
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
}: any) {
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
}: any) {
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

function DetailFlyout({ activeDetail, isLayer = false, isMenuOpen, layer }: any) {
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
}: any) {
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
}: {
	children: ReactNode
	className: string
	layerRef: RefObject<HTMLDivElement | null>
	style?: CSSProperties
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
	hasDelete = false,
	onDelete,
	menuTitle = "",
}: {
	children: ReactNode
	hasDelete?: boolean
	onDelete?: () => void
	menuTitle?: string
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
}: any) {
	const menuIdRef = useRef(Symbol("elements-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [menuAnchorRect, setMenuAnchorRect] = useState<AnchorRect | null>()
	const [menuPanelStyle, setMenuPanelStyle] = useState<PanelStyle | undefined>()

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
		function handleOtherMenuOpen(e: Event) {
			const menuEvent = e as CustomEvent<symbol>
			if (menuEvent.detail === menuIdRef.current) return
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

		function handlePointerDown(e: MouseEvent) {
			const target = e.target as Node
			if (anchorRef?.current?.contains(target)) return
			if (modalRef.current?.contains(target)) return
			if (secondaryLayerRef.current?.contains(target)) return
			if (detailLayerRef.current?.contains(target)) return

			closeMenu()
		}

		function handleKeyDown(e: KeyboardEvent) {
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

function isSameLayerDetail(activeDetail: any, detailOption: MenuOption, optionText?: string, anchorRect?: AnchorRect) {
	return (
		activeDetail?.element === detailOption &&
		activeDetail.optionText === optionText &&
		activeDetail.anchorRect === anchorRect
	)
}

function isSamePrimaryDetail(activeSecondaryMenu: any, detailOption: MenuOption, optionText?: string) {
	return (
		activeSecondaryMenu?.type === "detail" &&
		activeSecondaryMenu.element === detailOption &&
		activeSecondaryMenu.optionText === optionText
	)
}

function getSelectedPrimaryOptionText(activeSecondaryMenu: any) {
	if (activeSecondaryMenu?.type === "detail") return activeSecondaryMenu.optionText
	if (activeSecondaryMenu?.type === "submenu") return activeSecondaryMenu.categoryText
	return undefined
}

function isActiveSubmenu(activeSecondaryMenu: any, categoryText?: string) {
	return (
		activeSecondaryMenu?.type === "submenu" &&
		activeSecondaryMenu.categoryText === categoryText
	)
}

function addCategoryText(option: MenuOption, categoryText?: string) {
	if (!categoryText) return option

	return {
		...option,
		selectedCategoryText: categoryText,
	}
}

function isPrimaryOptionClickable(option: MenuOption) {
	return !optionOpensSubmenu(option)
}

function normalizeElementMenuOptions(elementOptions: MenuOption[] = []) {
	return elementOptions.map(normalizeElementMenuOption)
}

function getSelectableOption(option?: MenuOption | null) {
	if (!option) return null
	if (option.selectOption) return option.selectOption
	if (!option.list) return option
	return null
}

function getDetailOption(option: MenuOption) {
	return getSelectableOption(option) || option
}

function optionOpensSubmenu(option?: MenuOption | null) {
	return Array.isArray(option?.list) && !getSelectableOption(option)
}

function normalizeElementMenuOption(option: MenuOption): MenuOption {
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

function hasImplicitDirectSelectOption(option: MenuOption) {
	return option.list?.length === 1 && option.list[0]?.text === option.text
}

function getMenuLayerClassName({ placement, type, isLayer = false, isOpen }: any) {
	return joinClassNames(
		"flyoutMenuPanel",
		isOpen ? "flyoutMenuPanelOpen" : "flyoutMenuPanelClosing",
		isLayer && "flyoutMenuPanel-layer",
		`flyoutMenuPanel-${placement}`,
		type === "submenu" && "flyoutMenuPanel-submenu",
		type === "detail" && "flyoutMenuPanel-detail",
	)
}

function joinClassNames(...classNames: Array<string | false | undefined>) {
	return classNames.filter(Boolean).join(" ")
}
