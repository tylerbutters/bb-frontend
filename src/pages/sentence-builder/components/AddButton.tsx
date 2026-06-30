import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"
import ElementsMenu from "../elements-menu/ElementsMenu"
import type { MenuOption, MousePosition } from "../types"
import "./AddButton.css"

interface AddButtonProps {
	locked?: boolean
	mouse: MousePosition
	elementOptions?: MenuOption[]
	addElement: (element: MenuOption) => void
	hasSearch?: boolean
	text?: string
	disabled?: boolean
}

export default function AddButton({
	locked,
	mouse,
	elementOptions,
	addElement,
	hasSearch,
	text,
	disabled = false,
}: AddButtonProps) {
	const EDGE_SIZE = 50
	const ref = useRef<HTMLButtonElement | null>(null)
	const buttonText = text || getOptionsButtonText(elementOptions)

	const [isVisible, setIsVisible] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	useEffect(() => {
		if (disabled) {
			setIsVisible(false)
			setIsModalOpen(false)
			return
		}

		const rect = ref.current?.getBoundingClientRect()
		if (!rect) return

		const near =
			mouse.x >= rect.left - EDGE_SIZE &&
			mouse.x <= rect.right + EDGE_SIZE &&
			mouse.y >= rect.top - EDGE_SIZE &&
			mouse.y <= rect.bottom + EDGE_SIZE

		setIsVisible(Boolean(near || isModalOpen || locked))
	}, [disabled, mouse, isModalOpen, locked])

	return (
		<div className="modalContainer">
			<ElementsMenu
				anchorRef={ref}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				onSelect={addElement}
				elementOptions={elementOptions}
				hasDelete={false}
				hasSearch={hasSearch}
				menuTitle={formatMenuTitle(buttonText)}
			/>

			<button
				type="button"
				ref={ref}
				className={`addButton ${isModalOpen ? "addButtonOpen" : ""}`}
				onClick={() => {
					if (!disabled) setIsModalOpen((prev) => !prev)
				}}
				disabled={disabled}
				style={{
					width: isVisible ? 60 : 0,
					opacity: isModalOpen ? 1 : isVisible ? "" : 0,
					borderWidth: isVisible ? 1 : 0,
				}}
				aria-label={`+ ${buttonText}`}
			>
				<Plus className="addButtonIcon" size={30} aria-hidden="true" />
				<div className="addButtonText">{buttonText}</div>
			</button>
		</div>
	)
}

function getOptionsButtonText(elementOptions: MenuOption[] = []) {
	if (elementOptions.some((option) => Array.isArray(option?.list))) return "word"

	const optionTypes = [
		...new Set(elementOptions.map((option) => option?.elementType).filter(Boolean)),
	]

	if (optionTypes.length === 1) return optionTypes[0]
	if (optionTypes.includes("verb") || optionTypes.includes("adjective")) return "auxiliary"

	return "word"
}

function formatMenuTitle(text = "") {
	if (!text) return ""
	return text.charAt(0).toUpperCase() + text.slice(1)
}
