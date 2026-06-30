import type { ComponentType, Dispatch, RefObject, SetStateAction } from "react"
import UntypedElementsMenu from "./ElementsMenu"
import type { MenuOption } from "../types"

export interface ElementsMenuProps {
	anchorRef: RefObject<HTMLElement | null>
	isModalOpen: boolean
	setIsModalOpen: Dispatch<SetStateAction<boolean>>
	onSelect: (element: MenuOption) => void
	elementOptions?: MenuOption[]
	deleteElement?: () => void
	hasDelete?: boolean
	hasSearch?: boolean
	menuTitle?: string
	secondHasSearch?: boolean
}

// ElementsMenu is still JavaScript during this migration slice. This adapter
// gives TypeScript callers the real public contract until the menu is converted.
const ElementsMenu = UntypedElementsMenu as ComponentType<ElementsMenuProps>

export default ElementsMenu
