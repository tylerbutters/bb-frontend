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
import type { AnchorRect, AnchoredPanelController, PanelStyle } from "./anchoredPopover"
import type { ElementDetail } from "./DetailPanel"
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

type MenuLayerType = "submenu" | "detail"

interface ActiveSubmenu {
	type: "submenu"
	categoryText?: string | null
	elementOptions?: MenuOption[]
	anchorRect: AnchorRect
}

interface ActiveDetail {
	type: "detail"
	element: MenuOption
	detail: ElementDetail
	optionText?: string
	anchorRect: AnchorRect
}

type ActiveMenu = ActiveSubmenu | ActiveDetail

interface PositionedPanel {
	placement: string
	ref: RefObject<HTMLDivElement | null>
	style?: PanelStyle
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
	const detailLayer = useAnchoredPanel<ActiveDetail>({
		isEnabled: isModalOpen,
		menuRef: modalRef,
	})
	const secondaryLayer = useAnchoredPanel<ActiveMenu>({
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
			categoryText: option.text || undefined,
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

		detailLayer.open({ type: "detail", element: detailOption, detail, optionText, anchorRect })
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
			if (!isActiveSubmenu(activeSecondaryMenu, option.text || undefined)) {
				openSubmenuPanel(option, anchorRect)
			}
			return
		}

		openPrimaryDetailPanel(detailOption, anchorRect, option.text || undefined)
	}

	function handleHoverSecondaryOption(option: MenuOption, anchorRect: AnchorRect) {
		openNestedDetailPanel(getDetailOption(option), anchorRect, option.text || undefined)
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

interface PrimaryMenuLayerProps {
	isOpen: boolean
	layerRef: RefObject<HTMLDivElement | null>
	style: CSSProperties
	hasDelete: boolean
	hasSearch: boolean
	menuTitle: string
	elementOptions: MenuOption[]
	selectedOptionText?: string
	onDelete: () => void
	onHoverOption: (option: MenuOption, anchorRect: AnchorRect) => void
	onSelectOption: (option: MenuOption) => void
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
}: PrimaryMenuLayerProps) {
	return (
		<MenuLayer
			layerRef={layerRef}
			className={`elementsMenuContainer ${
				isOpen ? "elementsMenuOpen" : "elementsMenuClosing"
			}`}
			style={style}
			testId="elements-menu-primary"
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

interface SecondaryMenuLayersProps {
	activeMenu: ActiveMenu | null
	isMenuOpen: boolean
	layers: {
		detail: AnchoredPanelController<ActiveDetail>
		secondary: AnchoredPanelController<ActiveMenu>
	}
	secondHasSearch: boolean
	onHoverSecondaryOption: (option: MenuOption, anchorRect: AnchorRect) => void
	onSelectSecondaryOption: (option: MenuOption, categoryText?: string) => void
}

function SecondaryMenuLayers({
	activeMenu,
	isMenuOpen,
	layers,
	secondHasSearch,
	onHoverSecondaryOption,
	onSelectSecondaryOption,
}: SecondaryMenuLayersProps) {
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

interface SubmenuFlyoutProps {
	activeMenu: ActiveSubmenu
	detailLayer: AnchoredPanelController<ActiveDetail>
	isMenuOpen: boolean
	secondaryLayer: AnchoredPanelController<ActiveMenu>
	secondHasSearch: boolean
	onHoverSecondaryOption: (option: MenuOption, anchorRect: AnchorRect) => void
	onSelectSecondaryOption: (option: MenuOption, categoryText?: string) => void
}

function SubmenuFlyout({
	activeMenu,
	detailLayer,
	isMenuOpen,
	secondaryLayer,
	secondHasSearch,
	onHoverSecondaryOption,
	onSelectSecondaryOption,
}: SubmenuFlyoutProps) {
	const hasSearch =
		activeMenu.categoryText !== PUNCTUATION_CATEGORY_TEXT && secondHasSearch

	return (
		<AnchoredMenuLayer
			isOpen={isMenuOpen}
			layer={secondaryLayer}
			menuType="submenu"
		>
			<MenuSurface menuTitle={activeMenu.categoryText || ""}>
				<MenuList
					hasSearch={hasSearch}
					elementOptions={activeMenu.elementOptions}
					selectedOptionText={detailLayer.active?.optionText}
					onHoverOption={onHoverSecondaryOption}
					onSelectOption={(option) =>
						onSelectSecondaryOption(option, activeMenu.categoryText || undefined)
					}
				/>
			</MenuSurface>
		</AnchoredMenuLayer>
	)
}

interface DetailFlyoutProps {
	activeDetail: ActiveDetail | null
	isLayer?: boolean
	isMenuOpen: boolean
	layer: PositionedPanel
}

function DetailFlyout({ activeDetail, isLayer = false, isMenuOpen, layer }: DetailFlyoutProps) {
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

interface AnchoredMenuLayerProps {
	children: ReactNode
	isLayer?: boolean
	isOpen: boolean
	layer: PositionedPanel
	menuType: MenuLayerType
}

function AnchoredMenuLayer({
	children,
	isLayer = false,
	isOpen,
	layer,
	menuType,
}: AnchoredMenuLayerProps) {
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
			testId={getMenuLayerTestId(menuType, isLayer)}
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
	testId,
}: {
	children: ReactNode
	className: string
	layerRef: RefObject<HTMLDivElement | null>
	style?: CSSProperties
	testId: string
}) {
	return (
		<div
			ref={layerRef}
			className={className}
			data-testid={testId}
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

interface MenuLifecycleOptions {
	anchorRef: RefObject<HTMLElement | null>
	detailLayerRef: RefObject<HTMLDivElement | null>
	isModalOpen: boolean
	modalRef: RefObject<HTMLDivElement | null>
	resetDetailLayer: () => void
	resetSecondaryLayer: () => void
	secondaryLayerRef: RefObject<HTMLDivElement | null>
	setIsModalOpen: (isOpen: boolean) => void
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
}: MenuLifecycleOptions) {
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

function isSameLayerDetail(
	activeDetail: ActiveDetail | null,
	detailOption: MenuOption,
	optionText?: string,
	anchorRect?: AnchorRect,
) {
	return (
		activeDetail?.element === detailOption &&
		activeDetail.optionText === optionText &&
		activeDetail.anchorRect === anchorRect
	)
}

function isSamePrimaryDetail(
	activeSecondaryMenu: ActiveMenu | null,
	detailOption: MenuOption,
	optionText?: string,
) {
	return (
		activeSecondaryMenu?.type === "detail" &&
		activeSecondaryMenu.element === detailOption &&
		activeSecondaryMenu.optionText === optionText
	)
}

function getSelectedPrimaryOptionText(activeSecondaryMenu: ActiveMenu | null) {
	if (activeSecondaryMenu?.type === "detail") return activeSecondaryMenu.optionText
	if (activeSecondaryMenu?.type === "submenu") return activeSecondaryMenu.categoryText || undefined
	return undefined
}

function isActiveSubmenu(activeSecondaryMenu: ActiveMenu | null, categoryText?: string) {
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
		normalizedOption.selectOption = normalizedOption.list?.[0]
	}

	return normalizedOption
}

function hasImplicitDirectSelectOption(option: MenuOption) {
	return option.list?.length === 1 && option.list[0]?.text === option.text
}

function getMenuLayerClassName({
	placement,
	type,
	isLayer = false,
	isOpen,
}: {
	placement: string
	type: MenuLayerType
	isLayer?: boolean
	isOpen: boolean
}) {
	return joinClassNames(
		"flyoutMenuPanel",
		isOpen ? "flyoutMenuPanelOpen" : "flyoutMenuPanelClosing",
		isLayer && "flyoutMenuPanel-layer",
		`flyoutMenuPanel-${placement}`,
		type === "submenu" && "flyoutMenuPanel-submenu",
		type === "detail" && "flyoutMenuPanel-detail",
	)
}

function getMenuLayerTestId(menuType: MenuLayerType, isLayer: boolean) {
	if (menuType === "submenu") return "elements-menu-submenu-flyout"
	return isLayer ? "elements-menu-detail-layer-flyout" : "elements-menu-detail-flyout"
}

function joinClassNames(...classNames: Array<string | false | undefined>) {
	return classNames.filter(Boolean).join(" ")
}
