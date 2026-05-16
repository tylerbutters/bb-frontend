import { useEffect, useRef, useState, useLayoutEffect } from "react"
import AddElementModal from "../AddElementModal"
import "../App.css"
import Adjective from "./Adjective"
import Noun from "./Noun"
import Verb from "./Verb"
import useElementsStore from "../useElementsStore"
import Coupla from "./Coupla"
import Punctuation from "./Punctuation"
import verbsDictionary from "../verbs.json"

export default function Element({ element, mouse, replaceElement, deleteElement }) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedElements, setSelectedElements] = useState()
	const [isClosing, setIsClosing] = useState(false)
	const allElements = useElementsStore((state) => state)
	const defaultElements = {
		noun: allElements.noun,
		verb: verbsDictionary,
		adjective: allElements.adjective,
	}

	// useEffect(() => {
	// 	alert("test")
	// }, [element])

	function renderElement() {
		const props = {
			element,
			onClickSelf: () => setIsModalOpen(true),
			replaceElement,
			deleteElement: deleteElement,
			mouse,
		}

		switch (element?.type) {
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
			default:
				return null
		}
	}

	return (
		<div className="modalContainer">
			<AddElementModal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				elements={defaultElements}
				onSelect={setSelectedElements}
				deleteElement={() => setIsClosing(true)}
				isElement={true}
			/>
			<Resize element={element} isClosing={isClosing} onCloseComplete={deleteElement}>
				{renderElement()}
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
			className="elementContainer"
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
