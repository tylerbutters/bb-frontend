import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"

export default function Verb({ element, onClickSelf, replaceElement, deleteElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)

	return (
		<div className="baseElement verbElement">
			<div className="elementText" onClick={onClickSelf}>
				{element.stem}
			</div>
			<Conjugation
				parentConjugation={element}
				updateConjugation={replaceElement}
				deleteElement={deleteElement}
			/>
		</div>
	)
}
function Conjugation({ parentConjugation, updateConjugation, deleteElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)
	const [conjugationOptions, setConjugationOptions] = useState()
	const currentConjugation = parentConjugation?.next
	const isIrregularVerb = currentConjugation.stem === "する" || currentConjugation.stem === "くる"

	useEffect(() => {
		setConjugationOptions(getConjugationOptions())
		// alert(JSON.stringify(parentConjugation))
	}, [])

	function getGodanElements() {
		const godanMap = {
			く: ["か", "き", "く", "け", "こ", "いて", "いた"],
			ぐ: ["が", "ぎ", "ぐ", "げ", "ご", "いで", "いだ"],
			す: ["さ", "し", "す", "せ", "そ", "して", "した"],
			ぶ: ["ば", "び", "ぶ", "べ", "ぼ", "んで", "んで"],
			む: ["ま", "み", "む", "め", "も", "んで", "んだ"],
			ぬ: ["な", "に", "ぬ", "ね", "の", "いて", "いた"],
			る: ["ら", "り", "る", "れ", "ろ", "って", "った"],
			つ: ["た", "ち", "つ", "て", "と", "って", "った"],
			う: ["わ", "い", "う", "え", "お", "って", "った"],
		}

		const row = godanMap[parentConjugation.ending]
		if (!row) return null

		const [B1, B2, B3, B4, B5, Bte, Bta] = row

		const old = allElements.conjugations.godanDefaults

		const irregularHonorific = ["くださる", "いらっしゃる", "なさる", "おっしゃる"]

		if (irregularHonorific.includes(parentConjugation.kana)) {
			return {
				[B1]: old.B1,
				["い"]: [...old.B2, "い"],
				[B2]: [],
				[B3]: old.B3,
				[B4]: old.B4,
				[B5]: old.B5,
				[Bte]: old.Bte,
				[Bta]: old.Bta,
			}
		} else if (parentConjugation.value === "行く") {
			return {
				[B1]: old.B1,
				[B2]: old.B2,
				[B3]: old.B3,
				[B4]: old.B4,
				[B5]: old.B5,
				["って"]: [],
				["った"]: [],
			}
		}

		return {
			[B1]: old.B1,
			[B2]: [...old.B2, B2],
			[B3]: old.B3,
			[B4]: old.B4,
			[B5]: old.B5,
			[Bte]: old.Bte,
			[Bta]: old.Bta,
		}
	}

	function getConjugationOptions() {
		// alert(JSON.stringify(parentConjugation))
		switch (parentConjugation.verbType) {
			case "suru":
				// alert(JSON.stringify(allElements?.conjugations?.["する"].conjugationOptions))
				return allElements?.conjugations?.["する"].conjugationOptions || []
			case "kuru":
				return allElements?.conjugations?.["くる"].conjugationOptions || []
			case "ichidan":
				return allElements?.conjugations?.["ichidanDefault"].conjugationOptions || []
			case "godan":
				return getGodanElements()
			default:
				return (
					allElements?.conjugations?.[
						`${parentConjugation?.stem}${parentConjugation?.ending || ""}`
					]?.conjugationOptions || []
				)
		}
	}

	function getConjugationToReplace(selectedConjugation) {
		if (parentConjugation.verbType === "godan") {
			// alert(JSON.stringify(selectedConjugation))
			//only change the base (last character)
			if (!selectedConjugation.type || selectedConjugation.type === selectedConjugation.value) {
				updateConjugation({
					...parentConjugation,
					ending: selectedConjugation.value,
					next: {},
				})
			} else {
				updateConjugation({
					...parentConjugation,
					ending: selectedConjugation.type,
					next: {
						...currentConjugation,

						stem: allElements.conjugations[selectedConjugation.value].stem || "",
						ending: allElements.conjugations[selectedConjugation.value].ending || "",
						next: {},
					},
				})
			}
		} else {
			// alert(JSON.stringify(allElements.conjugations[selectedConjugation.value]))
			updateConjugation({
				...parentConjugation,
				next: {
					...currentConjugation,
					stem: allElements.conjugations[selectedConjugation.value].stem || "",
					ending: allElements.conjugations[selectedConjugation.value].ending || "",
					next: {},
				},
			})
		}
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={conjugationOptions}
				onSelect={getConjugationToReplace}
				isIrregularVerb={isIrregularVerb}
				deleteElement={deleteElement}
			/>
			<div className="baseInsideElement conjugation">
				<div className="insideElementText" onClick={() => setIsModalOpen(true)}>
					{parentConjugation.verbType === "godan" && parentConjugation.ending}
					{currentConjugation?.stem}
				</div>

				{Object.keys(currentConjugation?.next || {}).length !== 0 ? (
					<Conjugation
						parentConjugation={currentConjugation}
						updateConjugation={(updatedChild) =>
							updateConjugation({
								...parentConjugation,
								next: {
									...currentConjugation,
									...updatedChild,
								},
							})
						}
					/>
				) : (
					currentConjugation?.ending && (
						<ConjugationEnding
							conjugation={currentConjugation}
							addConjugation={(newEnd) => {
								updateConjugation({
									...parentConjugation,
									next: {
										...currentConjugation,
										...newEnd,
									},
								})
							}}
						/>
					)
				)}
			</div>
		</div>
	)
}

function ConjugationEnding({ conjugation, addConjugation }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const allElements = useElementsStore((state) => state)

	function onSelect(selected) {
		addConjugation({
			next: {
				stem: allElements.conjugations[selected.value]?.stem,
				ending: allElements.conjugations[selected.value]?.ending,
			},
		})
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={
					allElements.conjugations[`${conjugation?.stem}${conjugation?.ending}`]
						.conjugationOptions || []
				}
				onSelect={onSelect}
			/>
			<div className="baseInsideElement conjugationEnding" onClick={() => setIsModalOpen(true)}>
				<div className="insideElementText">{conjugation.ending}</div>
			</div>
		</div>
	)
}
