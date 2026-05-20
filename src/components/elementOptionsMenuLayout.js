export const MENU_TRANSITION_MS = 160
export const MENU_OPEN_EVENT = "element-options-menu-open"

const MENU_VIEWPORT_PADDING = 16
const MENU_ANCHOR_GAP = 10
const MENU_PANEL_GAP = 8
const MENU_PANEL_WIDTH = 300

function clamp(value, min, max) {
	if (max < min) return min
	return Math.min(max, Math.max(min, value))
}

export function getPanelWidth() {
	if (typeof window === "undefined") return MENU_PANEL_WIDTH

	const availableWidth = window.innerWidth - MENU_VIEWPORT_PADDING * 2
	const maxPanelWidth = (availableWidth - MENU_PANEL_GAP) / 2

	return Math.max(0, Math.min(MENU_PANEL_WIDTH, maxPanelWidth))
}

export function getSecondaryPlacement(layout) {
	return layout?.secondaryPlacement ?? "right"
}

export function getMenuLeft(layout, secondaryPlacement) {
	if (!layout) return 0
	if (secondaryPlacement === "left") {
		return layout.primaryLeft - layout.panelWidth - MENU_PANEL_GAP
	}

	return layout.primaryLeft
}

export function getNextMenuLayout(anchor, menu) {
	const anchorRect = anchor.getBoundingClientRect()
	const panelWidth = getPanelWidth()
	const menuHeight = menu?.getBoundingClientRect().height || 0
	const anchorCenter = anchorRect.left + anchorRect.width / 2
	const naturalPrimaryLeft = anchorCenter - panelWidth / 2
	const totalWidth = panelWidth * 2 + MENU_PANEL_GAP
	const canRenderSecondaryOnRight =
		naturalPrimaryLeft + totalWidth <= window.innerWidth - MENU_VIEWPORT_PADDING
	const secondaryPlacement = canRenderSecondaryOnRight ? "right" : "left"
	const primaryLeft =
		secondaryPlacement === "right"
			? clamp(
					naturalPrimaryLeft,
					MENU_VIEWPORT_PADDING,
					window.innerWidth - MENU_VIEWPORT_PADDING - totalWidth,
				)
			: clamp(
					naturalPrimaryLeft,
					MENU_VIEWPORT_PADDING + panelWidth + MENU_PANEL_GAP,
					window.innerWidth - MENU_VIEWPORT_PADDING - panelWidth,
				)

	return {
		panelWidth,
		primaryLeft,
		secondaryPlacement,
		top: anchorRect.top - MENU_ANCHOR_GAP - menuHeight,
	}
}

export function isSameMenuLayout(currentLayout, nextLayout) {
	return (
		currentLayout &&
		Math.abs(currentLayout.primaryLeft - nextLayout.primaryLeft) < 0.5 &&
		Math.abs(currentLayout.top - nextLayout.top) < 0.5 &&
		Math.abs(currentLayout.panelWidth - nextLayout.panelWidth) < 0.5 &&
		currentLayout.secondaryPlacement === nextLayout.secondaryPlacement
	)
}
