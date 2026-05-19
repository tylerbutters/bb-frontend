import { useEffect, useRef, useState, useLayoutEffect } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import Adjective from "./Adjective"
import Noun from "./Noun"
import Verb from "./Verb"
import useElementsStore from "../useElementsStore"
import Coupla from "./Coupla"
import Punctuation from "./Punctuation"
import dictionary from "../jmdict/processed-jmdict.json"
import Particle from "../element attachments/Particle"
import AddButton from "../AddButton"
import Adverb from "./Adverb"
import Desu from "./Desu"
import Counter from "./Counter"

export default function Element({ element, mouse, updateElement, deleteElement, defaultElements }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	// const [selectedElements, setSelectedElements] = useState()
	const [isClosing, setIsClosing] = useState(false)
	const [particleOptions, setParticleOptions] = useState([])
	const particles = useElementsStore((state) => state.particles)

	function getParticleOptions() {
		const availableParticles = particles.filter((particle) =>
			particle.attachesTo.includes("na-type"),
		)
		// alert(JSON.stringify(availableParticles.map((particle) => ({ text: particle.text }))))
		setParticleOptions(
			availableParticles.map((particle) => ({ elementType: "particle", text: particle.text })),
		)
	}

	function addParticle(selectedElement) {
		updateElement({ ...element, particle: selectedElement })
	}

	useEffect(() => {
		getParticleOptions()
	}, [])

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
		}
	}

	function renderElement() {
		const props = {
			element,
			onClickSelf: () => setIsModalOpen(true),
			updateElement,
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
			case "coupla":
				return <Coupla {...props} />
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
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elementOptions={defaultElements}
				onSelect={updateElement}
				deleteElement={() => setIsClosing(true)}
				hasDelete={true}
			/>
			<Resize element={element} isClosing={isClosing} onCloseComplete={deleteElement}>
				<div className="elementContainer" style={{ backgroundColor: getColor().primary }}>
					{renderElement()}
					{element.particle ? (
						<Particle
							element={element.particle}
							elementOptions={particleOptions}
							updateElement={addParticle}
							deleteElement={deleteElement}
						/>
					) : (
						<AddButton
							mouse={mouse}
							elementOptions={particleOptions}
							addElement={addParticle}
							hasSearch={true}
						/>
					)}
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
