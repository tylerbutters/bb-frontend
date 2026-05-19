import { useEffect, useState } from "react"
import Conjugation from "../element attachments/Conjugation"
import AddElementModal from "../AddElementModal"
import useElementsStore from "../useElementsStore"
import NoDesu from "../element attachments/NoDesu"
import AddButton from "../AddButton"

export default function Desu({ element, updateElement, deleteElement, mouse, secondaryColor }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const conjugations = useElementsStore((state) => state.conjugations)

	useEffect(() => {
		initializeVerb(element)
		// alert(JSON.stringify(element))
		// updateElement({
		// 	stem: "だ",
		// })
	}, [])

	// useEffect(() => {
	// 	alert(JSON.stringify(element))
	// }, [element])

	function initializeVerb(newElement) {
		updateElement({
			...newElement,
			conjugation: {
				stem: newElement?.stem,
			},
		})
	}

	function addNoDesu(newElement) {
		// alert(
		// 			JSON.stringify({
		// 				...element,
		// 				noDesu: newElement,
		// 			}),
		// 		)

		updateElement({
			...element,
			noDesu: newElement,
		})
	}

	return (
		<div className="modalContainer">
			{/* <AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={desuConjugations}
				onSelect={initializeVerb}
				deleteElement={deleteElement}
				hasDelete={true}
			/> */}
			<div className="baseElement verbElement">
				<NoDesu
					element={element.noDesu}
					updateElement={addNoDesu}
					deleteElement={() => updateElement({ ...element, noDesu: null })}
					mouse={mouse}
					color={secondaryColor}
				/>
				{element.conjugation && (
					<Conjugation
						parentConjugation={element}
						updateConjugation={updateElement}
						deleteElement={deleteElement}
						mouse={mouse}
						color={secondaryColor}
					/>
				)}
			</div>
		</div>
	)
}
