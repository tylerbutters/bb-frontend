import { Fragment, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react"
import ElementOptionsMenu from "../components/ElementOptionsMenu"
import "../App.css"
import Adjective from "./Adjective"
import Noun from "./Noun"
import Verb from "./Verb"
import useGrammarStore from "../store/useGrammarStore"
import Punctuation from "./Punctuation"
import Particle from "../attachments/Particle"
import Adverb from "./Adverb"
import Desu from "./Desu"
import Counter from "./Counter"

const ELEMENT_COLORS = {
	noun: {
		primary: "rgba(255, 138, 138, 0.72)",
		secondary: "rgba(255, 138, 138, 0.24)",
	},
	adjective: {
		primary: "rgba(255, 184, 112, 0.74)",
		secondary: "rgba(255, 184, 112, 0.24)",
	},
	verb: {
		primary: "rgba(138, 180, 255, 0.74)",
		secondary: "rgba(138, 180, 255, 0.24)",
	},
	adverb: {
		primary: "rgba(139, 199, 149, 0.72)",
		secondary: "rgba(139, 199, 149, 0.24)",
	},
	counter: {
		primary: "rgba(207, 143, 255, 0.72)",
		secondary: "rgba(207, 143, 255, 0.24)",
	},
	desu: {
		primary: "rgba(130, 204, 214, 0.72)",
		secondary: "rgba(130, 204, 214, 0.24)",
	},
	default: {
		primary: "rgba(255, 255, 255, 0.18)",
		secondary: "rgba(255, 255, 255, 0.12)",
	},
}

export default function Element({ element, mouse, updateElement, deleteElement, defaultElements }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isClosing, setIsClosing] = useState(false)
	const particles = useGrammarStore((state) => state.particles)
	const particleOptions = useMemo(() => {
		const availableParticles = particles.filter((particle) =>
			particle.attachesTo.includes(element.elementType),
		)
		if (element.adjectiveType) {
			availableParticles.push(
				...particles.filter((particle) => particle.attachesTo.includes(element.adjectiveType)),
			)
		}
		return availableParticles?.map((particle) => ({ elementType: "particle", text: particle.text }))
	}, [element.adjectiveType, element.elementType, particles])

	useEffect(() => {
		setIsModalOpen(false)
		setIsClosing(false)
	}, [element.sentenceElementId, element.elementType])

	function getElementKey() {
		return [
			element.sentenceElementId,
			element.elementType,
			element.text,
			element.textKana,
			element.stem,
			element.ending,
		]
			.filter(Boolean)
			.join(":")
	}

	function updateBaseElement(newElement) {
		updateElement(
			newElement.sentenceElementId === element.sentenceElementId
				? newElement
				: {
						...newElement,
						sentenceElementId: element.sentenceElementId,
					},
		)
	}

	function addParticle(selectedElement) {
		updateElement({ ...element, particle: selectedElement })
	}

	function renderElement() {
		const props = {
			element,
			updateElement: updateBaseElement,
			deleteElement: () => setIsClosing(true),
			mouse,
			elementOptions: defaultElements,
			allColors: ELEMENT_COLORS,
		}

		switch (element?.elementType) {
			case "noun":
				return <Noun {...props} />
			case "adjective":
				return <Adjective {...props} />
			case "verb":
				return <Verb {...props} />
			case "punctuation":
				return <Punctuation {...props} />
			case "adverb":
				return <Adverb {...props} />
			case "desu":
				return <Desu {...props} />
			case "counter":
				return <Counter {...props} />
			default:
				return null
		}
	}

	function openMenuFromElementContainer(e) {
		//doesn't open if child elements are clicked
		if (e.target.closest(".baseInsideElement, .addButton, input, button")) return
		setIsModalOpen(true)
	}

	return (
		<div className="modalContainer">
			<ElementOptionsMenu
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={defaultElements}
				onSelect={updateElement}
				deleteElement={() => setIsClosing(true)}
				hasDelete={true}
			/>
			<Resize element={element} isClosing={isClosing} onCloseComplete={deleteElement}>
				<div
					className="elementContainer"
					style={{
						backgroundColor: ELEMENT_COLORS[element.elementType].primary,
						borderColor: isModalOpen && "white",
					}}
					onClick={openMenuFromElementContainer}
				>
					<Fragment key={getElementKey()}>{renderElement()}</Fragment>
					<Particle
						element={element.particle}
						elementOptions={particleOptions}
						updateElement={addParticle}
						deleteElement={() =>
							updateElement({
								...element,
								particle: null,
							})
						}
						mouse={mouse}
					/>
				</div>
			</Resize>
		</div>
	)
}

function Resize({ element, isClosing, onCloseComplete, children }) {
	const [width, setWidth] = useState(0)
	const [isOverflowVisible, setIsOverflowVisible] = useState(false)
	const contentRef = useRef(null)
	const hasClosedRef = useRef(false)

	useLayoutEffect(() => {
		if (!contentRef.current) return

		const el = contentRef.current

		const measure = () => {
			setWidth(el.scrollWidth)
		}
		measure()
		const observer = new ResizeObserver(() => {
			measure()
		})

		observer.observe(el)

		return () => observer.disconnect()
	}, [element])

	useEffect(() => {
		// alert(isClosing)
		if (isClosing) {
			setIsOverflowVisible(false)
			requestAnimationFrame(() => {
				setWidth(0)
			})
		}
	}, [isClosing])

	return (
		<div
			style={{
				width,
				overflow: isOverflowVisible ? "visible" : "hidden",
				transition: "width 0.3s ease",
			}}
			onTransitionEnd={(e) => {
				if (e.propertyName !== "width") return

				if (hasClosedRef.current) return

				if (isClosing) {
					hasClosedRef.current = true
					onCloseComplete()
				} else {
					setIsOverflowVisible(true)
				}
			}}
		>
			<div
				ref={contentRef}
				style={{
					display: "inline-block",
					whiteSpace: "nowrap",
				}}
			>
				{children}
			</div>
		</div>
	)
}
