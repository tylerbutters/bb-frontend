import { useMemo, useRef, useState } from "react"
import ElementsMenu from "../element-options-menu/ElementsMenu"
import "../elements/Element.css"
import AddButton from "../components/AddButton"
import verbs from "../jmdict/processed/verbs.json"
import Verb from "../elements/Verb"
import ConjugationEnding from "./ConjugationEnding"
import Adjective from "../elements/Adjective"
import Particle from "./Particle"
import {
	createConjugationFromData,
	getGodanConjugationOptions,
	initializeNestedElement,
} from "../grammar/conjugationOptions"
import { auxiliaries, conjugations } from "../grammar/conjugationData"
import { particles } from "../grammar/particleData"

export function getConjugationOptionsForParent(parentConjugation, conjugations) {
	let conjugationOptions

	switch (parentConjugation.elementType) {
		case "adjective":
			switch (parentConjugation.adjectiveType) {
				case "i-type":
					conjugationOptions = conjugations["iAdjDefault"]
					break
				case "ii":
					conjugationOptions = conjugations["iiDefault"]
					break
				default:
					conjugationOptions = []
					break
			}
			break
		case "verb": //is the first conjugation
			switch (parentConjugation.verbType) {
				case "suru":
					conjugationOptions = conjugations["suruDefault"] || []
					break
				case "kuru":
					conjugationOptions = conjugations["kuruDefault"] || []
					break
				case "ichidan":
					conjugationOptions = conjugations["ichidanDefault"] || []
					break
				case "kureru":
					conjugationOptions = conjugations["kureruDefault"] || []
					break
				default:
					conjugationOptions = getGodanConjugationOptions(parentConjugation)
					break
			}
			break
		case "desu":
			conjugationOptions = conjugations["desuDefault"]
			break
		default:
			conjugationOptions =
				parentConjugation.conjugationOptions ||
				conjugations[`${parentConjugation.stem || ""}${parentConjugation.ending || ""}`]
					?.conjugationOptions ||
				[]
	}
	return conjugationOptions || []
}

export default function Conjugation({
	parentConjugation,
	updateConjugation,
	deleteElement,
	mouse,
	color,
	allColors,
	addButtonsDisabled,
	disabled = false,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef(null)
	const currentConjugation = parentConjugation?.conjugation
	const conjugationOptions = getConjugationOptionsForParent(parentConjugation, conjugations)
	const particleOptions = useMemo(
		() => particles.filter((particle) => particle.attachesTo.includes("te")),
		[],
	)

	function addParticle(selectedElement) {
		if (disabled) return
		updateCurrentConjugation({ middleParticle: selectedElement })
	}

	function updateCurrentConjugation(updates) {
		if (disabled) return
		updateConjugation({
			...parentConjugation,
			conjugation: {
				...currentConjugation,
				...updates,
			},
		})
	}

	function clearCurrentConjugation() {
		if (disabled) return
		updateConjugation({
			...parentConjugation,
			conjugation: {},
		})
	}

	function openConjugationMenu(e) {
		if (disabled) return
		if (e.target.closest(".addButton, input, button")) return

		const clickedInsideChildElement = e.target.closest(".baseInsideElement")
		if (clickedInsideChildElement && clickedInsideChildElement !== e.currentTarget) return

		setIsModalOpen(true)
	}

	function getConjugationUpdate(selectedConjugation) {
		if (disabled) return

		//changing element
		if (currentConjugation.elementType && selectedConjugation.elementType) {
			updateCurrentConjugation(initializeNestedElement(selectedConjugation))
			return
		}

		//adding element
		if (selectedConjugation.elementType) {
			updateCurrentConjugation({
				conjugation: initializeNestedElement(selectedConjugation),
			})
			return
		}

		let conjugationData = conjugations[selectedConjugation.text]

		if (selectedConjugation.replacesParent) {
			if (!conjugationData) {
				alert("Haven't made this conjugation yet")
				return
			}

			updateConjugation({
				...parentConjugation,
				conjugation: {
					...createConjugationFromData(conjugationData),
					replacesParent: true,
				},
			})
			return
		}

		if (parentConjugation.verbType?.includes("godan")) {
			const selectedCategory =
				conjugationOptions.find(
					(category) => category.text === selectedConjugation.selectedCategoryText,
				) ||
				conjugationOptions.find((category) =>
					category.list?.some((conjugation) => conjugation.text === selectedConjugation.text),
				)
			if (!selectedCategory) return
			const singleCharacterConjugation = selectedConjugation.text === selectedCategory.text

			if (singleCharacterConjugation) {
				//only change the ending of the verb

				updateConjugation({
					...parentConjugation,
					baseEnding: parentConjugation.baseEnding || parentConjugation.ending,
					ending: selectedConjugation.text,
					conjugation: {
						conjugationType: selectedConjugation.conjugationType,
						stem: selectedConjugation.text,
						conjugation: {},
					},
				})
			} else {
				if (!conjugationData) {
					alert("Haven't made this conjugation yet")
					return
				}
				//change the ending of verb and add conjugation
				updateConjugation({
					...parentConjugation,
					baseEnding: parentConjugation.baseEnding || parentConjugation.ending,
					ending: selectedCategory.text,
					conjugation: createConjugationFromData(conjugationData),
				})
			}
		} else {
			if (!conjugationData) {
				alert("Haven't made this conjugation yet")
				return
			}
			//if its ichidan ru
			if (selectedConjugation.text === "る") {
				conjugationData = conjugations["ichidanDefault"]
			}

			// //if its an te verb or b2
			updateConjugation({
				...parentConjugation,
				conjugation: createConjugationFromData(conjugationData),
			})
		}
	}

	function renderNextConjugation() {
		if (!currentConjugation) return null

		if (Object.keys(currentConjugation.conjugation || {}).length !== 0) {
			return (
				<Conjugation
					color={color}
					allColors={allColors}
					mouse={mouse}
					parentConjugation={currentConjugation}
					updateConjugation={(updatedChild) => updateCurrentConjugation(updatedChild)}
					addButtonsDisabled={addButtonsDisabled}
					disabled={disabled}
				/>
			)
		}

		if (currentConjugation.conjugationType === "aux") {
			return (
				<AddButton
					elementOptions={auxiliaries}
					mouse={mouse}
					hasSearch={true}
					addElement={getConjugationUpdate}
					text="auxiliary"
					disabled={addButtonsDisabled || disabled}
				/>
			)
		}

		if (currentConjugation.conjugationType === "te") {
			return (
				<AddButton
					elementOptions={verbs}
					mouse={mouse}
					hasSearch={true}
					addElement={getConjugationUpdate}
					text="verb"
					disabled={addButtonsDisabled || disabled}
				/>
			)
		}

		if (currentConjugation.ending) {
			return (
				<ConjugationEnding
					color={color}
					conjugation={currentConjugation}
					updateConjugation={(nextConjugation) => {
						updateCurrentConjugation({
							conjugation: nextConjugation,
						})
					}}
					disabled={disabled}
				/>
			)
		}

		return null
	}

	if (currentConjugation?.elementType === "verb") {
		// alert(JSON.stringify(currentConjugation))
		return (
			<div className="modalContainer">
				{!disabled && (
					<ElementsMenu
						anchorRef={elementRef}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						elementOptions={parentConjugation.conjugationType === "aux" ? auxiliaries : verbs}
						onSelect={getConjugationUpdate}
						deleteElement={clearCurrentConjugation}
						hasDelete={true}
						hasSearch={true}
						menuTitle={parentConjugation.conjugationType === "aux" ? "Auxiliary" : "Verb"}
					/>
				)}
				<div
					ref={elementRef}
					className={`baseInsideElement conjugationElement ${
						disabled ? "baseInsideElementLocked" : ""
					}`}
					style={{ backgroundColor: allColors.verb.primary }}
					onClick={openConjugationMenu}
				>
					<Verb
						element={currentConjugation}
						allColors={allColors}
						updateElement={(updatedChild) => updateCurrentConjugation(updatedChild)}
						deleteElement={clearCurrentConjugation}
						mouse={mouse}
						addButtonsDisabled={addButtonsDisabled}
						conjugationDisabled={disabled}
					/>
				</div>
			</div>
		)
	} else if (currentConjugation?.elementType === "adjective") {
		return (
			<div className="modalContainer">
				{!disabled && (
					<ElementsMenu
						anchorRef={elementRef}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						elementOptions={auxiliaries}
						onSelect={getConjugationUpdate}
						deleteElement={clearCurrentConjugation}
						hasDelete={true}
						hasSearch={true}
						menuTitle="Auxiliary"
					/>
				)}
				<div
					ref={elementRef}
					className={`baseInsideElement conjugationElement ${
						disabled ? "baseInsideElementLocked" : ""
					}`}
					style={{ backgroundColor: allColors.adjective.primary }}
					onClick={openConjugationMenu}
				>
					<Adjective
						element={currentConjugation}
						allColors={allColors}
						updateElement={(updatedChild) => updateCurrentConjugation(updatedChild)}
						deleteElement={clearCurrentConjugation}
						mouse={mouse}
						addButtonsDisabled={addButtonsDisabled}
						conjugationDisabled={disabled}
					/>
				</div>
			</div>
		)
	}

	return (
		<div className="modalContainer">
			{!disabled && (
				<ElementsMenu
					anchorRef={elementRef}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={conjugationOptions || []}
					onSelect={getConjugationUpdate}
					menuTitle="Conjugation"
					secondHasSearch={false}
				/>
			)}
			<div
				ref={elementRef}
				className={`baseInsideElement conjugationElement ${
					disabled ? "baseInsideElementLocked" : ""
				}`}
				style={{ backgroundColor: color, borderColor: isModalOpen && "white" }}
				onClick={openConjugationMenu}
			>
				<div className="insideElementText">
					{!currentConjugation.replacesParent &&
						parentConjugation.verbType?.includes("godan") &&
						parentConjugation.ending !== currentConjugation?.stem &&
						parentConjugation.ending}
					{!currentConjugation?.stem && !currentConjugation?.ending && (
						<div style={{ width: 40, height: 80 }} />
					)}
					{currentConjugation?.stem}
				</div>
				{currentConjugation.conjugationType === "te" && (
					<Particle
						element={currentConjugation.middleParticle}
						elementOptions={particleOptions}
						updateElement={addParticle}
						deleteElement={() =>
							updateCurrentConjugation({
								middleParticle: null,
							})
						}
						mouse={mouse}
						disabled={addButtonsDisabled || disabled}
					/>
				)}
				{renderNextConjugation()}
			</div>
		</div>
	)
}
