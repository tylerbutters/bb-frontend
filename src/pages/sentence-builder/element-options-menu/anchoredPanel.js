import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"

const MENU_VIEWPORT_PADDING = 16

export const HIDDEN_PANEL_STYLE = { left: 0, top: 0, visibility: "hidden" }

export function useAnchoredPanel({ isEnabled, menuRef, onCloseComplete }) {
	const ref = useRef(null)
	const [active, setActive] = useState(null)
	const [placement, setPlacement] = useState("right")
	const [style, setStyle] = useState()

	const reset = useCallback(() => {
		hideNativePopover(ref.current)
		setActive(null)
		setPlacement("right")
		setStyle(undefined)
	}, [])

	const close = useCallback(() => {
		if (!active) return

		reset()
		onCloseComplete?.()
	}, [active, onCloseComplete, reset])

	const open = useCallback((nextActive) => {
		setActive(nextActive)
		setPlacement("right")
		setStyle(undefined)
	}, [])

	useLayoutEffect(() => {
		if (!isEnabled || !active) return

		const panel = ref.current
		const menu = menuRef.current
		const anchorRect = active.anchorRect
		if (!panel || !menu || !anchorRect) return

		showNativePopover(panel)

		const panelRect = panel.getBoundingClientRect()
		const { placement: nextPlacement, style: nextStyle } = getAnchoredPanelLayout(
			anchorRect,
			panelRect,
			getMenuPanelGap(menu),
		)

		setPlacement((currentPlacement) =>
			currentPlacement === nextPlacement ? currentPlacement : nextPlacement,
		)
		setStyle((currentStyle) => {
			if (
				currentStyle?.left === nextStyle.left &&
				currentStyle?.top === nextStyle.top
			) {
				return currentStyle
			}

			return nextStyle
		})
	}, [active, isEnabled, menuRef])

	return useMemo(
		() => ({
			active,
			close,
			open,
			placement,
			ref,
			reset,
			style,
		}),
		[active, close, open, placement, ref, reset, style],
	)
}

export function getElementAnchorRect(element) {
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

export function getMenuAnchorGap(menu) {
	const styles = window.getComputedStyle(menu)
	return parseFloat(styles.getPropertyValue("--element-options-anchor-gap")) || 0
}

export function getPrimaryMenuLayout(anchorRect, menuRect, anchorGap) {
	const maxLeft = window.innerWidth - menuRect.width - MENU_VIEWPORT_PADDING
	const maxTop = window.innerHeight - menuRect.height - MENU_VIEWPORT_PADDING
	const anchorCenter = anchorRect.left + anchorRect.width / 2
	const belowTop = anchorRect.bottom + anchorGap
	const aboveTop = anchorRect.top - menuRect.height - anchorGap
	const top = aboveTop >= MENU_VIEWPORT_PADDING ? aboveTop : belowTop
	const left = anchorCenter - menuRect.width / 2

	return {
		left: clampToViewport(left, maxLeft),
		top: clampToViewport(top, maxTop),
	}
}

export function showNativePopover(element) {
	if (!isNativePopoverSupported(element) || isNativePopoverOpen(element)) return

	try {
		element.showPopover()
	} catch {
		// React state still controls whether the menu is rendered.
	}
}

export function hideNativePopover(element) {
	if (!isNativePopoverSupported(element) || !isNativePopoverOpen(element)) return

	try {
		element.hidePopover()
	} catch {
		// The element may already be hidden or unmounted.
	}
}

function getMenuPanelGap(menu) {
	const styles = window.getComputedStyle(menu)
	return parseFloat(styles.getPropertyValue("--element-options-panel-gap")) || 0
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
			left: clampToViewport(left, maxLeft),
			top: clampToViewport(anchorRect.top, maxTop),
		},
	}
}

function clampToViewport(value, maxValue) {
	return Math.max(MENU_VIEWPORT_PADDING, Math.min(value, maxValue))
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
