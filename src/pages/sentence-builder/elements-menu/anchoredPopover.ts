import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { RefObject } from "react"

const MENU_VIEWPORT_PADDING = 16

export interface PanelStyle {
	left: number
	top: number
	visibility?: "hidden"
}

export interface AnchorRect {
	top: number
	right: number
	bottom: number
	left: number
	width: number
	height: number
}

interface AnchoredPanelState {
	anchorRect?: AnchorRect | null
	[key: string]: any
}

interface UseAnchoredPanelOptions {
	isEnabled: boolean
	menuRef: RefObject<HTMLElement | null>
	onCloseComplete?: () => void
}

type PopoverElement = HTMLElement & {
	showPopover?: () => void
	hidePopover?: () => void
}

export const HIDDEN_PANEL_STYLE: PanelStyle = { left: 0, top: 0, visibility: "hidden" }

export function useAnchoredPanel({ isEnabled, menuRef, onCloseComplete }: UseAnchoredPanelOptions) {
	const ref = useRef<HTMLDivElement | null>(null)
	const [active, setActive] = useState<AnchoredPanelState | null>(null)
	const [placement, setPlacement] = useState("right")
	const [style, setStyle] = useState<PanelStyle | undefined>()

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

	const open = useCallback((nextActive: AnchoredPanelState) => {
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

export function getElementAnchorRect(element?: HTMLElement | null): AnchorRect | null {
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

export function getMenuAnchorGap(menu: Element) {
	const styles = window.getComputedStyle(menu)
	return parseFloat(styles.getPropertyValue("--element-options-anchor-gap")) || 0
}

export function getPrimaryMenuLayout(anchorRect: AnchorRect, menuRect: DOMRect, anchorGap: number): PanelStyle {
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

export function showNativePopover(element?: HTMLElement | null) {
	if (!isNativePopoverSupported(element) || isNativePopoverOpen(element)) return

	try {
		;(element as PopoverElement).showPopover?.()
	} catch {
		// React state still controls whether the menu is rendered.
	}
}

export function hideNativePopover(element?: HTMLElement | null) {
	if (!isNativePopoverSupported(element) || !isNativePopoverOpen(element)) return

	try {
		;(element as PopoverElement).hidePopover?.()
	} catch {
		// The element may already be hidden or unmounted.
	}
}

function getMenuPanelGap(menu: Element) {
	const styles = window.getComputedStyle(menu)
	return parseFloat(styles.getPropertyValue("--element-options-panel-gap")) || 0
}

function getAnchoredPanelLayout(anchorRect: AnchorRect, panelRect: DOMRect, panelGap: number) {
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

function clampToViewport(value: number, maxValue: number) {
	return Math.max(MENU_VIEWPORT_PADDING, Math.min(value, maxValue))
}

function isNativePopoverSupported(element?: HTMLElement | null) {
	const popoverElement = element as PopoverElement | null | undefined
	return Boolean(popoverElement?.showPopover && popoverElement?.hidePopover)
}

function isNativePopoverOpen(element?: HTMLElement | null) {
	try {
		return Boolean(element?.matches?.(":popover-open"))
	} catch {
		return false
	}
}
