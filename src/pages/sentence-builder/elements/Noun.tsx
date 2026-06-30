import "./Element.css"
import Suffix from "../element-attachments/Suffix"
import Prefix from "../element-attachments/Prefix"
import JapaneseText from "../components/JapaneseText"
import type { ElementComponentProps, MenuOption } from "../types"

export default function Noun({
	mouse,
	element,
	updateElement,
	allColors,
	addButtonsDisabled,
	affixesDisabled = addButtonsDisabled,
}: ElementComponentProps) {
	function addElement(selectedElement: MenuOption) {
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
				color={allColors.noun.secondary}
				disabled={affixesDisabled}
			/>
			<div className="elementText">
				<JapaneseText text={element?.text} reading={element?.textKana} />
			</div>
			<Suffix
				element={element.suffix}
				updateElement={addElement}
				deleteElement={() => updateElement({ ...element, suffix: null })}
				mouse={mouse}
				color={allColors.noun.secondary}
				disabled={affixesDisabled}
			/>
		</div>
	)
}
