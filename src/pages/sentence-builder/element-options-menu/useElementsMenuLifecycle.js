import { useCallback, useEffect, useRef, useState } from "react"
import {
	MENU_CLOSE_EVENT,
	MENU_OPEN_EVENT,
	MENU_TRANSITION_MS,
} from "./elementsMenuConstants"
import { getElementAnchorRect, hideNativePopover } from "./anchoredPanel"

export default function useElementsMenuLifecycle({
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
		menuAnchorRect,
		menuPanelStyle,
		setMenuPanelStyle,
		shouldRenderMenu,
	}
}
