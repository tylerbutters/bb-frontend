import { useEffect, useState } from "react"
import ElementOptionsMenu from "../ElementOptionsMenu"
import "../App.css"
import useElementsStore from "../useElementsStore"
import AddButton from "../AddButton"
import dictionary from "../jmdict/processed-jmdict.json"
import Verb from "../elements/Verb"
import ConjugationEnding from "./ConjugationEnding"
import Adjective from "../elements/Adjective"
import Particle from "./Particle"

export default function Conjugation({
	parentConjugation,
	updateConjugation,
	deleteElement,
	mouse,
	color,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const conjugations = useElementsStore((state) => state.conjugations)
	const [conjugationOptions, setConjugationOptions] = useState()
	const [particleOptions, setParticleOptions] = useState()
	const currentConjugation = parentConjugation?.conjugation
	const auxiliaries = useElementsStore((state) => state.auxiliaries)
	const particles = useElementsStore((state) => state.particles)

	// const isIrregularVerb = currentConjugation.stem === "する" || currentConjugation.stem === "くる"

	useEffect(() => {
		getConjugationOptions()
		// alert(JSON.stringify(particles.filter((particle) => particle.attachesTo.includes("te"))))
		setParticleOptions(particles.filter((particle) => particle.attachesTo.includes("te")))
	}, [])

	function addParticle(selectedElement) {
		updateConjugation({
			...parentConjugation,
			conjugation: { ...currentConjugation, middleParticle: selectedElement },
		})
	}

	function getGodanConjugationOptions() {
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

		//find what category of godan it is
		const row = Object.values(godanMap).find((row) => row.includes(parentConjugation.ending))
		if (!row) return null

		const [B1, B2, B3, B4, B5, Bte, Bta] = row

		const godanDefaults = {
			B1: [{ text: "ない" }, { text: "れる" }, { text: "せる" }, { text: "ず" }],
			B2: [{ text: "ます" }],
			B4: [{ text: "ば" }, { text: "る" }, { text: "れ" }],
			B5: [{ text: "う" }],
		}

		if (parentConjugation.verbType === "godan-aru") {
			return [
				{
					text: B1,
					list: godanDefaults.B1,
				},
				{
					text: "い",
					list: [...godanDefaults.B2, { text: "い" }],
				},
				{
					text: B2,
					list: [{ text: B2, conjugationType: "aux" }],
				},
				{
					text: B3,
					list: [{ text: B3 }],
				},
				{
					text: B4,
					list: godanDefaults.B4,
				},
				{
					text: B5,
					list: godanDefaults.B5,
				},
				{
					text: Bte,
					list: [{ text: Bte, conjugationType: "te" }],
				},
				{
					text: Bta,
					list: [{ text: Bta }],
				},
			]
		} else if (parentConjugation.verbType === "godan-iku") {
			return [
				{
					text: B1,
					list: godanDefaults.B1,
				},
				{
					text: B2,
					list: [...godanDefaults.B2, { text: B2, conjugationType: "aux" }],
				},
				{
					text: B3,
					list: [{ text: B3 }],
				},
				{
					text: B4,
					list: godanDefaults.B4,
				},
				{
					text: B5,
					list: godanDefaults.B5,
				},
				{
					text: "って",
					list: [{ text: "って", conjugationType: "te" }],
				},
				{
					text: "った",
					list: [{ text: "った" }],
				},
			]
		}

		return [
			{
				text: B1,
				list: godanDefaults.B1,
			},
			{
				text: B2,
				list: [...godanDefaults.B2, { text: B2, conjugationType: "aux" }],
			},
			{
				text: B3,
				list: [{ text: B3 }],
			},
			{
				text: B4,
				list: godanDefaults.B4,
			},
			{
				text: B5,
				list: godanDefaults.B5,
			},
			{
				text: Bte,
				list: [{ text: Bte, conjugationType: "te" }],
			},
			{
				text: Bta,
				list: [{ text: Bta }],
			},
		]
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
						//godan, godan-iku, godan-aru
						conjugationOptions = getGodanConjugationOptions()
						break
				}
				break
			case "desu":
				// alert(JSON.stringify(conjugations["desuDefault"]))
				conjugationOptions = conjugations["desuDefault"]?.conjugationOptions
				break
			default:
				conjugationOptions =
					conjugations[`${parentConjugation.stem || ""}${parentConjugation.ending || ""}`]
						?.conjugationOptions || []
		}
		setConjugationOptions(conjugationOptions)
	}

	function getConjugationUpdate(selectedConjugation) {
		//its a verb or adj　or desu
		if (
			selectedConjugation.elementType === "verb" ||
			selectedConjugation.elementType === "adjective" ||
			selectedConjugation.elementType === "desu"
		) {
			//append to end of current conjugation
			updateConjugation({
				...parentConjugation,
				conjugation: {
					...currentConjugation,
					conjugation: selectedConjugation,
				},
			})

			return
		}

		let conjugationData = conjugations[selectedConjugation.text]

		if (parentConjugation.verbType?.includes("godan")) {
			const selectedCategory = conjugationOptions.find((category) =>
				category.list.some((conjugation) => conjugation.text === selectedConjugation.text),
			)
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
					conjugation: {
						conjugationType: conjugationData.conjugationType,
						stem: conjugationData.stem || "",
						ending: conjugationData.ending || "",
						conjugation: {},
					},
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
				conjugation: {
					conjugationType: conjugationData.conjugationType,
					stem: conjugationData.stem || "",
					ending: conjugationData.ending || "",
					conjugation: {},
				},
			})
		}
	}

	function renderNextConjugation() {
		// alert(JSON.stringify(currentConjugation))
		if (Object.keys(currentConjugation?.conjugation || {}).length !== 0) {
			return (
				<Conjugation
					color={color}
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
					addElement={getConjugationUpdate}
				/>
			)
		} else if (currentConjugation.conjugationType === "te") {
			return (
				<AddButton
					elementOptions={dictionary.verbs}
					mouse={mouse}
					hasSearch={true}
					addElement={getConjugationUpdate}
				/>
			)
		} else if (currentConjugation?.ending) {
			return (
				<ConjugationEnding
					color={color}
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

	if (currentConjugation?.elementType === "verb") {
		// alert(JSON.stringify(currentConjugation))
		return (
			<div className="baseInsideElement" style={{ backgroundColor: color }}>
				<Verb
					element={currentConjugation}
					elementOptions={auxiliaries}
					secondaryColor={color}
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
			</div>
		)
	} else if (currentConjugation?.elementType === "adjective") {
		// alert(JSON.stringify(currentConjugation))
		return (
			<Adjective
				element={currentConjugation}
				elementOptions={auxiliaries}
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
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={conjugationOptions || []}
				onSelect={getConjugationUpdate}
			/>
			<div className="baseInsideElement" style={{ backgroundColor: color }}>
				<div className="insideElementText" onClick={() => setIsModalOpen(true)}>
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
							updateConjugation({
								...currentConjugation,
								particle: null,
							})
						}
						mouse={mouse}
					/>
				)}
				{renderNextConjugation()}
			</div>
		</div>
	)
}
