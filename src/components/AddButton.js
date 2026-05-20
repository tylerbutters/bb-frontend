import { useEffect, useRef, useState } from "react"
import ElementOptionsMenu from "./ElementOptionsMenu"

export default function AddButton({
	locked,
	mouse,
	elementOptions,
	addElement,
	hasSearch,
	disabled = false,
}) {
	const EDGE_SIZE = 100
	const ref = useRef(null)

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
			/>

			<button
				type="button"
				ref={ref}
				className={`addButton ${isModalOpen ? "addButtonOpen" : ""}`}
				onClick={() => setIsModalOpen((prev) => !prev)}
				style={{
					width: isVisible ? 45 : 0,
					opacity: isVisible ? 1 : 0,
					borderWidth: isVisible ? 1 : 0,
				}}
			>
				+
			</button>
		</div>
	)
}
