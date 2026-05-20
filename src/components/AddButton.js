import { useEffect, useRef, useState } from "react"
import ElementOptionsMenu from "./ElementOptionsMenu"

export default function AddButton({
	locked,
	mouse,
	elementOptions,
	addElement,
	hasSearch,
	text,
	disabled = false,
}) {
	const EDGE_SIZE = 100
	const ref = useRef(null)
	const buttonText = text || getOptionsButtonText(elementOptions)
	// const visibleWidth = getVisibleButtonWidth(buttonText)

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

		setIsVisible(near || isModalOpen || locked)
	}, [disabled, mouse, isModalOpen, locked])

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
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
				onClick={() => setIsModalOpen((prev) => !prev)}
				style={{
					width: isVisible ? 60 : 0,
					opacity: isVisible ? 1 : 0,
					borderWidth: isVisible ? 1 : 0,
				}}
			>
				+<div className="addButtonText">{buttonText}</div>
			</button>
		</div>
	)
}

function getOptionsButtonText(elementOptions = []) {
	if (elementOptions.some((option) => Array.isArray(option?.list))) return "word"

	const optionTypes = [
		...new Set(elementOptions.map((option) => option?.elementType).filter(Boolean)),
	]

	if (optionTypes.length === 1) return optionTypes[0]
	if (optionTypes.includes("verb") || optionTypes.includes("adjective")) return "auxiliary"

	return "word"
}

// function getVisibleButtonWidth(text = "") {
// 	return Math.max(45, Math.min(84, text.length * 6 + 22))
// }

function formatMenuTitle(text = "") {
	if (!text) return ""
	return text.charAt(0).toUpperCase() + text.slice(1)
}
