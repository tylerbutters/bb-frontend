import { useEffect, useState } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import useElementsStore from "../useElementsStore"
import AddButton from "../AddButton"
import dictionary from "../jmdict/processed-jmdict.json"
import Verb from "./Verb"

export default function Conjugation({
	parentConjugation,
	updateConjugation,
	deleteElement,
	mouse,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const verbConjugations = useElementsStore((state) => state.conjugations.verbs)
	const [conjugationOptions, setConjugationOptions] = useState()
	const currentConjugation = parentConjugation?.conjugation
	const auxiliaries = useElementsStore((state) => state.auxiliaries)
	// const isIrregularVerb = currentConjugation.stem === "する" || currentConjugation.stem === "くる"

	useEffect(() => {
		setConjugationOptions(getConjugationOptions())
	}, [parentConjugation])

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

		const old = verbConjugations.godanDefaults

		if (parentConjugation.verbType === "godan-aru") {
			return [
				{
					text: B1,
					list: old.B1,
				},
				{
					text: "い",
					list: [...old.B2, { text: "い" }],
				},
				{
					text: B2,
					list: [],
				},
				{
					text: B3,
					list: old.B3,
				},
				{
					text: B4,
					list: old.B4,
				},
				{
					text: B5,
					list: old.B5,
				},
				{
					text: Bte,
					list: old.Bte,
				},
				{
					text: Bta,
					list: old.Bta,
				},
			]
		} else if (parentConjugation.verbType === "godan-iku") {
			return [
				{
					text: B1,
					list: old.B1,
				},
				{
					text: B2,
					list: [...old.B2, { text: B2 }],
				},
				{
					text: B3,
					list: old.B3,
				},
				{
					text: B4,
					list: old.B4,
				},
				{
					text: B5,
					list: old.B5,
				},
				{
					text: "って",
				},
				{
					text: "った",
				},
			]
		}

		return [
			{
				text: B1,
				list: old.B1,
			},
			{
				text: B2,
				list: [...old.B2, { text: B2 }],
			},
			{
				text: B3,
				list: old.B3,
			},
			{
				text: B4,
				list: old.B4,
			},
			{
				text: B5,
				list: old.B5,
			},
			{
				text: Bte,
				list: old.Bte,
			},
			{
				text: Bta,
				list: old.Bta,
			},
		]
	}

	function getConjugationOptions() {
		//is a conjugation in a conjugation
		if (!parentConjugation.verbType) {
			return (
				verbConjugations[`${parentConjugation.stem}${parentConjugation.ending}`]
					?.conjugationOptions || []
			)
		}

		//is the first conjugation
		switch (parentConjugation.verbType) {
			case "suru":
				return verbConjugations["suruDefault"]?.conjugationOptions || []
			case "kuru":
				return verbConjugations["kuruDefault"]?.conjugationOptions || []
			case "ichidan":
				return verbConjugations["ichidanDefault"]?.conjugationOptions || []
			case "kureru":
				alert("make kureru")
				return
			default:
				//godan, godan-iku, godan-aru
				return getGodanElements()
		}
	}

	function onSelectConjugationChange(selectedConjugation) {
		const conjugationData = verbConjugations[selectedConjugation.text]

		//its a verb
		if (!conjugationData) {
			if (
				currentConjugation?.conjugationType === "te" ||
				currentConjugation?.conjugationType === "aux"
			) {
				let auxElement
				if (selectedConjugation.elementType === "verb") {
					auxElement = dictionary.verbs.find((verb) => verb.text === selectedConjugation.text)
				} else if (selectedConjugation.elementType === "adjective") {
					auxElement = dictionary.adjectives.find(
						(adjective) => adjective.text === selectedConjugation.text,
					)
				}

				if (auxElement)
					return updateConjugation({
						...parentConjugation,
						conjugation: {
							...currentConjugation,
							conjugation: auxElement,
						},
					})
			}
		}

		if (parentConjugation.verbType?.includes("godan")) {
			const selectedCategory = conjugationOptions.find((category) =>
				category.list.some((conjugation) => conjugation.text === selectedConjugation.text),
			)

			const singleCharacterConjugation =
				selectedConjugation.list?.length === 0 || selectedCategory.text === selectedConjugation.text
			//only change the ending of the verb
			if (singleCharacterConjugation) {
				updateConjugation({
					...parentConjugation,
					ending: conjugationData.text,
					conjugation: {},
				})
			} else {
				//change the ending of verb and add conjugation
				updateConjugation({
					...parentConjugation,
					ending: selectedCategory.text,
					conjugation: {
						conjugationType: conjugationData.conjugationType,
						stem: conjugationData.stem || "",
						ending: conjugationData.ending || "",
						conjugation: {},
					},
				})
			}
		} else {
			// alert(JSON.stringify(selectedConjugation))

			// //if its an te verb or b2

			// alert(JSON.stringify(allElements.conjugations[selectedConjugation.value]))
			updateConjugation({
				...parentConjugation,
				conjugation: {
					conjugationType: conjugationData.conjugationType,
					stem: conjugationData.stem || "",
					ending: conjugationData.ending || "",
					conjugation: {},
				},
			})
		}
	}

	function renderOtherElement() {
		// alert(JSON.stringify(currentConjugation))
		if (Object.keys(currentConjugation?.conjugation || {}).length !== 0) {
			return (
				<Conjugation
					mouse={mouse}
					parentConjugation={currentConjugation}
					updateConjugation={(updatedChild) =>
						updateConjugation({
							...parentConjugation,
							conjugation: {
								...currentConjugation,
								...updatedChild,
							},
						})
					}
				/>
			)
		} else if (currentConjugation.conjugationType === "aux") {
			return (
				<AddButton
					elementOptions={auxiliaries}
					mouse={mouse}
					hasSearch={true}
					addElement={onSelectConjugationChange}
				/>
			)
		} else if (currentConjugation.conjugationType === "te") {
			return (
				<AddButton
					elementOptions={dictionary.verbs}
					mouse={mouse}
					hasSearch={true}
					addElement={onSelectConjugationChange}
				/>
			)
		} else if (currentConjugation?.ending) {
			return (
				<ConjugationEnding
					conjugation={currentConjugation}
					updateConjugation={(nextConjugation) => {
						updateConjugation({
							...parentConjugation,
							conjugation: {
								...currentConjugation,
								conjugation: nextConjugation,
							},
						})
					}}
				/>
			)
		}
	}

	if (currentConjugation.elementType === "verb") {
		return (
			<Verb
				element={currentConjugation}
				elementOptions={dictionary.auxiliaries}
				updateElement={(updatedChild) =>
					updateConjugation({
						...parentConjugation,
						conjugation: {
							...currentConjugation,
							...updatedChild,
						},
					})
				}
				deleteElement={() =>
					updateConjugation({
						...parentConjugation,
						conjugation: {},
					})
				}
				mouse={mouse}
			/>
		)
	} else if (currentConjugation.elementType === "adjective") {
		return alert("make adjective")
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions}
				onSelect={onSelectConjugationChange}
			/>
			<div className="baseInsideElement conjugation">
				<div className="insideElementText" onClick={() => setIsModalOpen(true)}>
					{parentConjugation.verbType?.includes("godan") &&
						parentConjugation.ending !== currentConjugation?.stem &&
						parentConjugation.ending}
					{currentConjugation?.stem}
				</div>
				{renderOtherElement()}
			</div>
		</div>
	)
}

function ConjugationEnding({ conjugation, updateConjugation }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const verbConjugations = useElementsStore((state) => state.conjugations.verbs)
	const [conjugationOptions, setConjugationOptions] = useState([])

	useEffect(() => {
		setConjugationOptions(getConjugationOptions())
	}, [])

	function onSelect(selectedConjugation) {
		updateConjugation({
			stem: verbConjugations[selectedConjugation.text]?.stem,
			ending: verbConjugations[selectedConjugation.text]?.ending,
		})
	}

	function getConjugationOptions() {
		return verbConjugations[`${conjugation?.stem}${conjugation?.ending}`]?.conjugationOptions || []
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions}
				onSelect={onSelect}
			/>
			<div className="baseInsideElement conjugationEnding" onClick={() => setIsModalOpen(true)}>
				<div className="insideElementText">{conjugation.ending}</div>
			</div>
		</div>
	)
}
