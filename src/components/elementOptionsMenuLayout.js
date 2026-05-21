export const MENU_TRANSITION_MS = 160
export const MENU_OPEN_EVENT = "element-options-menu-open"

const MENU_VIEWPORT_PADDING = 16
const MENU_ANCHOR_GAP = 10
export const MENU_PANEL_GAP = 8
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

export function getPrimaryMenuLayout(anchor, primaryPanel) {
	const anchorRect = anchor.getBoundingClientRect()
	const primaryRect = primaryPanel?.getBoundingClientRect()
	const primaryWidth = primaryRect?.width || getPanelWidth()
	const primaryHeight = primaryRect?.height || 0
	const anchorCenter = anchorRect.left + anchorRect.width / 2
	const naturalPrimaryLeft = anchorCenter - primaryWidth / 2
	const primaryLeft = clamp(
		naturalPrimaryLeft,
		MENU_VIEWPORT_PADDING,
		window.innerWidth - MENU_VIEWPORT_PADDING - primaryWidth,
	)

	return {
		primaryLeft,
		top: anchorRect.top - MENU_ANCHOR_GAP - primaryHeight,
	}
}

export function getSecondaryPlacement(layout, primaryPanel, secondaryPanel) {
	const primaryWidth = primaryPanel?.getBoundingClientRect().width || getPanelWidth()
	const secondaryWidth = secondaryPanel?.getBoundingClientRect().width || getPanelWidth()
	const secondaryRightEdge =
		layout.primaryLeft + primaryWidth + MENU_PANEL_GAP + secondaryWidth

	return secondaryRightEdge <= window.innerWidth - MENU_VIEWPORT_PADDING ? "right" : "left"
}

export function isSameMenuLayout(currentLayout, nextLayout) {
	return (
		currentLayout &&
		Math.abs(currentLayout.primaryLeft - nextLayout.primaryLeft) < 0.5 &&
		Math.abs(currentLayout.top - nextLayout.top) < 0.5
	)
}
