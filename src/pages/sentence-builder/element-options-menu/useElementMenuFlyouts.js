import { useCallback } from "react"
import { getElementDetail } from "./ElementDetailPanel"
import {
	getDetailOption,
	getSelectableOption,
	optionOpensSubmenu,
} from "./elementMenuOptions"

export default function useElementMenuFlyouts({
	closeMenu,
	detailLayer,
	secondaryLayer,
	onSelect,
}) {
	const {
		active: activeDetailLayer,
		close: closeDetailLayer,
		open: openDetailLayer,
		reset: resetDetailLayer,
	} = detailLayer
	const {
		active: activeSecondaryMenu,
		close: closeSecondaryLayer,
		open: openSecondaryLayer,
	} = secondaryLayer
	const activeSubmenuCategoryText = getActiveSubmenuCategoryText(activeSecondaryMenu)
	const selectedPrimaryOptionText = getSelectedPrimaryOptionText(activeSecondaryMenu)

	const openSecondaryMenu = useCallback(
		(nextSecondaryMenu) => {
			resetDetailLayer()
			openSecondaryLayer(nextSecondaryMenu)
		},
		[openSecondaryLayer, resetDetailLayer],
	)

	const openSubmenuPanel = useCallback(
		(option, anchorRect) => {
			openSecondaryMenu({
				type: "submenu",
				categoryText: option.text,
				elementOptions: option.list,
				anchorRect,
			})
		},
		[openSecondaryMenu],
	)

	const openNestedDetailLayer = useCallback(
		(detailOption, anchorRect, optionText) => {
			const detail = getElementDetail(detailOption)
			if (!detail) {
				closeDetailLayer()
				return
			}

			if (isSameLayerDetail(activeDetailLayer, detailOption, optionText, anchorRect)) {
				return
			}

			openDetailLayer({ element: detailOption, detail, optionText, anchorRect })
		},
		[activeDetailLayer, closeDetailLayer, openDetailLayer],
	)

	const openPrimaryDetailPanel = useCallback(
		(detailOption, detail, anchorRect, optionText) => {
			openSecondaryMenu({
				type: "detail",
				element: detailOption,
				detail,
				optionText,
				anchorRect,
			})
		},
		[openSecondaryMenu],
	)

	const showPrimaryDetail = useCallback(
		(detailOption, anchorRect, optionText) => {
			const detail = getElementDetail(detailOption)
			if (!detail) {
				closeSecondaryLayer()
				return
			}

			if (isSamePrimaryDetail(activeSecondaryMenu, detailOption, optionText)) {
				return
			}

			openPrimaryDetailPanel(detailOption, detail, anchorRect, optionText)
		},
		[activeSecondaryMenu, closeSecondaryLayer, openPrimaryDetailPanel],
	)

	const selectOption = useCallback(
		(option, categoryText) => {
			onSelect(addCategoryText(option, categoryText))
			closeMenu()
		},
		[closeMenu, onSelect],
	)

	const handleSelectPrimaryOption = useCallback(
		(option, anchorRect) => {
			const selectableOption = getSelectableOption(option)

			if (selectableOption) {
				selectOption(selectableOption)
				return
			}

			if (activeSubmenuCategoryText === option.text) {
				closeSecondaryLayer()
				return
			}

			openSubmenuPanel(option, anchorRect)
		},
		[activeSubmenuCategoryText, closeSecondaryLayer, openSubmenuPanel, selectOption],
	)

	const handleHoverPrimaryOption = useCallback(
		(option, anchorRect) => {
			const detailOption = getDetailOption(option)

			if (optionOpensSubmenu(option)) {
				if (activeSubmenuCategoryText !== option.text) {
					openSubmenuPanel(option, anchorRect)
				}
				return
			}

			showPrimaryDetail(detailOption, anchorRect, option.text)
		},
		[activeSubmenuCategoryText, openSubmenuPanel, showPrimaryDetail],
	)

	const handleHoverSecondaryOption = useCallback(
		(option, anchorRect) => {
			const detailOption = getDetailOption(option)
			openNestedDetailLayer(detailOption, anchorRect, option.text)
		},
		[openNestedDetailLayer],
	)

	return {
		activeSecondaryMenu,
		activeSubmenuCategoryText,
		handleHoverPrimaryOption,
		handleHoverSecondaryOption,
		handleSelectPrimaryOption,
		selectOption,
		selectedPrimaryOptionText,
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

function getActiveSubmenuCategoryText(activeSecondaryMenu) {
	return activeSecondaryMenu?.type === "submenu"
		? activeSecondaryMenu.categoryText
		: undefined
}

function getSelectedPrimaryOptionText(activeSecondaryMenu) {
	if (activeSecondaryMenu?.type === "detail") return activeSecondaryMenu.optionText
	if (activeSecondaryMenu?.type === "submenu") return activeSecondaryMenu.categoryText
	return undefined
}

function addCategoryText(option, categoryText) {
	if (!categoryText) return option

	return {
		...option,
		selectedCategoryText: categoryText,
	}
}
