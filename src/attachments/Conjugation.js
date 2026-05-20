import { useMemo, useState } from "react"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import "../App.css"
import useGrammarStore from "../store/useGrammarStore"
import AddButton from "../components/AddButton"
import dictionary from "../jmdict/processed-jmdict.json"
import Verb from "../elements/Verb"
import ConjugationEnding from "./ConjugationEnding"
import Adjective from "../elements/Adjective"
import Particle from "./Particle"
import {
	createConjugationFromData,
	getGodanConjugationOptions,
	initializeNestedElement,
} from "../grammar/conjugationOptions"

export default function Conjugation({
	parentConjugation,
	updateConjugation,
	deleteElement,
	mouse,
	color,
	allColors,
	addButtonsDisabled,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const conjugations = useGrammarStore((state) => state.conjugations)
	const currentConjugation = parentConjugation?.conjugation
	const auxiliaries = useGrammarStore((state) => state.auxiliaries)
	const particles = useGrammarStore((state) => state.particles)
	const conjugationOptions = getConjugationOptions()
	const particleOptions = useMemo(
		() => particles.filter((particle) => particle.attachesTo.includes("te")),
		[particles],
	)

	function addParticle(selectedElement) {
		updateCurrentConjugation({ middleParticle: selectedElement })
	}

	function updateCurrentConjugation(updates) {
		updateConjugation({
			...parentConjugation,
			conjugation: {
				...currentConjugation,
				...updates,
			},
		})
	}

	function clearCurrentConjugation() {
		updateConjugation({
			...parentConjugation,
			conjugation: {},
		})
	}

	function openConjugationMenu(e) {
		if (e.target.closest(".addButton, input, button")) return

		const clickedInsideChildElement = e.target.closest(".baseInsideElement")
		if (clickedInsideChildElement && clickedInsideChildElement !== e.currentTarget) return

		setIsModalOpen(true)
	}

	function getConjugationOptions() {
		let conjugationOptions

		switch (parentConjugation.elementType) {
			case "adjective":
				conjugationOptions = conjugations["iAdjDefault"]?.conjugationOptions
				break
			case "verb": //is the first conjugation
				switch (parentConjugation.verbType) {
					case "suru":
						conjugationOptions = conjugations["suruDefault"]?.conjugationOptions || []
						break
					case "kuru":
						conjugationOptions = conjugations["kuruDefault"]?.conjugationOptions || []
						break
					case "ichidan":
						conjugationOptions = conjugations["ichidanDefault"]?.conjugationOptions || []
						break
					case "kureru":
						conjugationOptions = conjugations["kureruDefault"]?.conjugationOptions || []
						break
					default:
						conjugationOptions = getGodanConjugationOptions(parentConjugation)
						break
				}
				break
			case "desu":
				conjugationOptions = conjugations["desuDefault"]?.conjugationOptions
				break
			default:
				conjugationOptions =
					conjugations[`${parentConjugation.stem || ""}${parentConjugation.ending || ""}`]
						?.conjugationOptions || []
		}
		return conjugationOptions || []
	}

	function getConjugationUpdate(selectedConjugation) {
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

		if (parentConjugation.verbType?.includes("godan")) {
			const selectedCategory =
				conjugationOptions.find(
					(category) => category.text === selectedConjugation.selectedCategoryText,
				) ||
				conjugationOptions.find((category) =>
					category.list.some((conjugation) => conjugation.text === selectedConjugation.text),
				)
			if (!selectedCategory) return
			const singleCharacterConjugation = selectedConjugation.text === selectedCategory.text

			if (singleCharacterConjugation) {
				//only change the ending of the verb

				updateConjugation({
					...parentConjugation,
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
					disabled={addButtonsDisabled}
				/>
			)
		}

		if (currentConjugation.conjugationType === "te") {
			return (
				<AddButton
					elementOptions={dictionary.verbs || []}
					mouse={mouse}
					hasSearch={true}
					addElement={getConjugationUpdate}
					disabled={addButtonsDisabled}
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
				/>
			)
		}

		return null
	}

	if (currentConjugation?.elementType === "verb") {
		// alert(JSON.stringify(currentConjugation))
		return (
			<div className="modalContainer">
				<ElementOptionsMenu
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={
						parentConjugation.conjugationType === "aux" ? auxiliaries : dictionary.verbs
					}
					onSelect={getConjugationUpdate}
					deleteElement={clearCurrentConjugation}
					hasDelete={true}
					hasSearch={true}
				/>
				<div
					className="baseInsideElement conjugationElement"
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
					/>
				</div>
			</div>
		)
	} else if (currentConjugation?.elementType === "adjective") {
		return (
			<div className="modalContainer">
				<ElementOptionsMenu
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					elementOptions={auxiliaries}
					onSelect={getConjugationUpdate}
					deleteElement={clearCurrentConjugation}
					hasDelete={true}
					hasSearch={true}
				/>
				<div
					className="baseInsideElement conjugationElement"
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
					/>
				</div>
			</div>
		)
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions || []}
				onSelect={getConjugationUpdate}
			/>
			<div
				className="baseInsideElement conjugationElement"
				style={{ backgroundColor: color, borderColor: isModalOpen && "white" }}
				onClick={openConjugationMenu}
			>
				<div className="insideElementText">
					{parentConjugation.verbType?.includes("godan") &&
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
						disabled={addButtonsDisabled}
					/>
				)}
				{renderNextConjugation()}
			</div>
		</div>
	)
}
