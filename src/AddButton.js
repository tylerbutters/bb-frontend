import { useEffect, useRef, useState } from "react"
import AddElementModal from "./AddElementModal"

export default function AddButton({ locked, mouse, elementOptions, addElement, hasSearch }) {
	const EDGE_SIZE = 100
	const ref = useRef(null)

	const [isVisible, setIsVisible] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	useEffect(() => {
		const rect = ref.current?.getBoundingClientRect()
		if (!rect) return

		const near =
			mouse.x >= rect.left - EDGE_SIZE &&
			mouse.x <= rect.right + EDGE_SIZE &&
			mouse.y >= rect.top - EDGE_SIZE &&
			mouse.y <= rect.bottom + EDGE_SIZE

		setIsVisible(near || isModalOpen || locked)
	}, [mouse, isModalOpen, locked])

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				onSelect={addElement}
				elementOptions={elementOptions}
				isElement={false}
				hasSearch={hasSearch}
			/>

			<div
				ref={ref}
				className="addButton"
				onClick={() => setIsModalOpen((prev) => !prev)}
				style={{
					backgroundColor: isModalOpen ? "lightgrey" : "grey",
					width: isVisible ? 50 : 0,
					// margin: isVisible ? "0 2.5px" : "0",
				}}
			>
				+
			</div>
		</div>
	)
}
