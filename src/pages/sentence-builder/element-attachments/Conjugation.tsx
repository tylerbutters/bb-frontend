import type { MouseEvent } from "react"
import { useMemo, useRef, useState } from "react"
import ElementsMenu from "../elements-menu/TypedElementsMenu"
import "../elements/Element.css"
import AddButton from "../components/AddButton"
import verbs from "../jmdict/processed/verbs.json"
import Verb from "../elements/Verb"
import ConjugationEnding from "./ConjugationEnding"
import Adjective from "../elements/Adjective"
import Particle from "./Particle"
import {
	createConjugationFromForm,
	findGodanConjugationCategory,
	getConjugationForm,
	getConjugationOptionsForParent,
	initializeNestedElement,
} from "../grammar/conjugationOptions"
import { auxiliaries } from "../grammar/conjugationData"
import { particles } from "../grammar/particleData"
import type {
	ConjugationOption,
	ElementColorSet,
	MenuOption,
	MousePosition,
	SentenceElement,
} from "../types"

type EmptyConjugation = Record<string, never>

type ConjugationElement = Omit<SentenceElement, "conjugation" | "particle"> &
	MenuOption & {
		conjugation?: ConjugationElement | EmptyConjugation | null
		middleParticle?: MenuOption | null
		particle?: MenuOption | null
	}

interface ConjugationProps {
	parentConjugation: ConjugationElement
	updateConjugation: (conjugation: ConjugationElement) => void
	deleteElement?: () => void
	mouse: MousePosition
	color: string
	allColors: ElementColorSet
	addButtonsDisabled?: boolean
	disabled?: boolean
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
}: ConjugationProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const elementRef = useRef<HTMLDivElement | null>(null)
	const currentConjugation = parentConjugation?.conjugation
	const conjugationOptions = getConjugationOptionsForParent(
		parentConjugation as SentenceElement & ConjugationOption,
	)
	const particleOptions = useMemo<MenuOption[]>(
		() =>
			particles
				.filter((particle) => particle.attachesTo.includes("te"))
				.map((particle) => ({ ...particle })),
		[],
	)

	function addParticle(selectedElement: MenuOption) {
		if (disabled) return
		updateCurrentConjugation({ middleParticle: selectedElement })
	}

	function updateCurrentConjugation(updates: Partial<ConjugationElement>) {
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

	function openConjugationMenu(e: MouseEvent<HTMLDivElement>) {
		if (disabled) return
		const target = e.target as HTMLElement
		if (target.closest(".addButton, input, button")) return

		const clickedInsideChildElement = target.closest(".baseInsideElement")
		if (clickedInsideChildElement && clickedInsideChildElement !== e.currentTarget) return

		setIsModalOpen(true)
	}

	function getConjugationUpdate(selectedConjugation: MenuOption) {
		if (disabled) return

		// Changing an already nested verb or adjective swaps the nested element itself.
		if (currentConjugation.elementType && selectedConjugation.elementType) {
			updateCurrentConjugation(initializeNestedElement(selectedConjugation))
			return
		}

		// Adding a verb or adjective starts a new nested conjugation chain.
		if (selectedConjugation.elementType) {
			updateCurrentConjugation({
				conjugation: initializeNestedElement(selectedConjugation),
			})
			return
		}

		let conjugationForm = getConjugationForm(selectedConjugation.text || "")

		if (selectedConjugation.replacesParent) {
			if (!conjugationForm) {
				alert("Haven't made this conjugation yet")
				return
			}

			updateConjugation({
				...parentConjugation,
				conjugation: {
					...createConjugationFromForm(conjugationForm),
					replacesParent: true,
				},
			})
			return
		}

		if (isGodanVerb(parentConjugation)) {
			const selectedCategory =
				findGodanConjugationCategory(
					parentConjugation as SentenceElement & ConjugationOption,
					selectedConjugation.selectedCategoryText || "",
				) ||
				findGodanConjugationCategory(
					parentConjugation as SentenceElement & ConjugationOption,
					selectedConjugation.text || "",
				)
			if (!selectedCategory) return
			const singleCharacterConjugation = selectedConjugation.text === selectedCategory.text

			if (singleCharacterConjugation) {
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
				if (!conjugationForm) {
					alert("Haven't made this conjugation yet")
					return
				}
				updateConjugation({
					...parentConjugation,
					baseEnding: parentConjugation.baseEnding || parentConjugation.ending,
					ending: selectedCategory.text,
					conjugation: createConjugationFromForm(conjugationForm),
				})
			}
		} else {
			if (!conjugationForm) {
				alert("Haven't made this conjugation yet")
				return
			}
			if (selectedConjugation.text === "る") {
				conjugationForm = {}
			}

			updateConjugation({
				...parentConjugation,
				conjugation: createConjugationFromForm(conjugationForm),
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
							conjugation: nextConjugation as ConjugationElement,
						})
					}}
					disabled={disabled}
				/>
			)
		}

		return null
	}

	if (currentConjugation?.elementType === "verb") {
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
						isGodanVerb(parentConjugation) &&
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

function isGodanVerb(element: ConjugationElement) {
	return typeof element.verbType === "string" && element.verbType.includes("godan")
}
