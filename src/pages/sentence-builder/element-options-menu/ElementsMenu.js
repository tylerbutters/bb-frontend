import { useLayoutEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import "./ElementsMenu.css"
import {
	PrimaryMenuLayer,
	SecondaryMenuLayers,
} from "./ElementMenuLayers"
import {
	HIDDEN_PANEL_STYLE,
	getMenuAnchorGap,
	getPrimaryMenuLayout,
	showNativePopover,
	useAnchoredPanel,
} from "./anchoredPanel"
import { normalizeElementMenuOptions } from "./elementMenuOptions"
import useElementMenuFlyouts from "./useElementMenuFlyouts"
import useElementsMenuLifecycle from "./useElementsMenuLifecycle"

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
		menuAnchorRect,
		menuPanelStyle,
		setMenuPanelStyle,
		shouldRenderMenu,
	} = useElementsMenuLifecycle({
		anchorRef,
		detailLayerRef: detailLayer.ref,
		isModalOpen,
		modalRef,
		resetDetailLayer: detailLayer.reset,
		resetSecondaryLayer: secondaryLayer.reset,
		secondaryLayerRef: secondaryLayer.ref,
		setIsModalOpen,
	})
	const {
		activeSecondaryMenu,
		activeSubmenuCategoryText,
		handleHoverPrimaryOption,
		handleHoverSecondaryOption,
		handleSelectPrimaryOption,
		selectOption,
		selectedPrimaryOptionText,
	} = useElementMenuFlyouts({
		closeMenu,
		detailLayer,
		onSelect,
		secondaryLayer,
	})

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
	}, [isModalOpen, menuAnchorRect, setMenuPanelStyle, shouldRenderMenu])

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
				activeSecondaryMenu={activeSecondaryMenu}
				activeSubmenuCategoryText={activeSubmenuCategoryText}
				detailLayer={detailLayer}
				secondaryLayer={secondaryLayer}
				secondHasSearch={secondHasSearch}
				onHoverSecondaryOption={handleHoverSecondaryOption}
				onSelectSecondaryOption={selectOption}
			/>
		</>,
		document.body,
	)
}
