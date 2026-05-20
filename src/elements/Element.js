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

	function getColor(elementType) {
		switch (elementType) {
			case "noun":
				return { primary: "rgba(255, 138, 138, 0.72)", secondary: "rgba(255, 138, 138, 0.24)" }
			case "adjective":
				return { primary: "rgba(255, 184, 112, 0.74)", secondary: "rgba(255, 184, 112, 0.24)" }
			case "verb":
				return { primary: "rgba(138, 180, 255, 0.74)", secondary: "rgba(138, 180, 255, 0.24)" }
			case "adverb":
				return { primary: "rgba(139, 199, 149, 0.72)", secondary: "rgba(139, 199, 149, 0.24)" }
			case "counter":
				return { primary: "rgba(207, 143, 255, 0.72)", secondary: "rgba(207, 143, 255, 0.24)" }
			case "desu":
				return { primary: "rgba(130, 204, 214, 0.72)", secondary: "rgba(130, 204, 214, 0.24)" }
			default:
				return { primary: "rgba(255, 255, 255, 0.18)", secondary: "rgba(255, 255, 255, 0.12)" }
		}
	}

	function renderElement() {
		const props = {
			element,
			updateElement: updateBaseElement,
			deleteElement: () => setIsClosing(true),
			mouse,
			elementOptions: defaultElements,
			secondaryColor: getColor(element.elementType).secondary,
		}

		switch (element?.elementType) {
			case "noun":
				return <Noun {...props} />
			case "adjective":
				return <Adjective {...props} />
			case "verb":
				return <Verb {...props} adjColor={getColor("adjective").secondary} />
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
					style={{ backgroundColor: getColor(element.elementType).primary }}
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
