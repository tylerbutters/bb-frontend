import "../App.css"
import Suffix from "../attachments/Suffix"
import Prefix from "../attachments/Prefix"

export default function Noun({ mouse, element, updateElement, secondaryColor }) {
	function addElement(selectedElement) {
		switch (selectedElement?.elementType) {
			case "prefix":
				updateElement({ ...element, prefix: selectedElement })
				return
			case "suffix":
				updateElement({ ...element, suffix: selectedElement })
				return
			default:
				return
		}
	}

	return (
		<div className="baseElement">
			<Prefix
				element={element.prefix}
				updateElement={addElement}
				deleteElement={() => updateElement({ ...element, prefix: null })}
				mouse={mouse}
				color={secondaryColor}
			/>
			<div className="elementText">{element?.text}</div>
			<Suffix
				element={element.suffix}
				updateElement={addElement}
				deleteElement={() => updateElement({ ...element, suffix: null })}
				mouse={mouse}
				color={secondaryColor}
			/>
		</div>
	)
}
