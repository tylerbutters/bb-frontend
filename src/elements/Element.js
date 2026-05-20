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

	function getColor() {
		switch (element?.elementType) {
			case "noun":
				return { primary: "#FF9C9C", secondary: "rgba(255,0,0,0.3" }
			case "adjective":
				return { primary: "#FFC88D", secondary: "rgba(255,131,0,0.3" }
			case "verb":
				return { primary: "#A8B5FF", secondary: "rgba(0, 38, 255, 0.2)" }
			case "adverb":
				return { primary: "#97C688", secondary: "" }
			case "counter":
				return { primary: "#DC9CFF", secondary: "rgba(165,0,255,0.2)" }
			case "desu":
				return { primary: "#9ECDD5", secondary: "rgba(0,179,205,0.3)" }
			default:
				return { primary: "red", secondary: "blue" }
		}
	}

	function renderElement() {
		const props = {
			element,
			onClickSelf: () => setIsModalOpen(true),
			updateElement: updateBaseElement,
			deleteElement: () => setIsClosing(true),
			mouse,
			elementOptions: defaultElements,
			secondaryColor: getColor().secondary,
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
				<div className="elementContainer" style={{ backgroundColor: getColor().primary }}>
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
