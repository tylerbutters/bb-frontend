import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import AddButton from "../components/AddButton"
import Element from "../elements/Element"
import normalizeElement from "../grammar/normalizeElement"
import useSentenceDragDrop from "../hooks/useSentenceDragDrop"
import SentenceText, { elementsToTextParts, textPartsToString } from "../components/SentenceText"
import adjectives from "../jmdict/processed/adjectives.json"
import adverbs from "../jmdict/processed/adverbs.json"
import counters from "../jmdict/processed/counters.json"
import nouns from "../jmdict/processed/nouns.json"
import verbs from "../jmdict/processed/verbs.json"
import useGrammarStore from "../store/useGrammarStore"

const SENTENCE_ELEMENTS_VIEWPORT_PADDING = 100
const GAME_MODES = [
	{
		id: "sandbox",
		title: "Sandbox",
		description: "Create any sentence you want.",
	},
	{
		id: "shuffle",
		title: "Shuffle practice",
		description: "Build the correct sentence from shuffled Japanese parts.",
	},
	{
		id: "translate",
		title: "Translate sentence practice",
		description: "Translate the English sentence into Japanese.",
	},
	{
		id: "conjugations",
		title: "Conjugation practice",
		description: "Choose the right conjugation for the sentence.",
	},
	{
		id: "fix sentence",
		title: "Fix sentence practice",
		description: "Find and fix the mistake in the Japanese sentence.",
	},
	{
		id: "particles",
		title: "Particle practice",
		description: "Choose the particle that fits the sentence.",
	},
	{
		id: "reorder",
		title: "Reorder practice",
		description: "Put the sentence elements in the correct order.",
	},
]

export default function SentenceBuilderPage({ currentUser, onLogout }) {
	const nextElementId = useRef(0)
	const sentenceElementsContainerRef = useRef(null)
	const sentenceElementsScaleRef = useRef(1)
	const scaleFrameRef = useRef(null)
	const scaleTimeoutRef = useRef(null)
	const [mouse, setMouse] = useState({ x: 0, y: 0 })
	const [addedElements, setAddedElements] = useState([])
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const [selectedGameMode, setSelectedGameMode] = useState(GAME_MODES[0].id)
	const [sentenceElementsScale, setSentenceElementsScale] = useState(1)
	const [translatePrompt, setTranslatePrompt] = useState("")
	const [translatePromptStatus, setTranslatePromptStatus] = useState("idle")
	const [translateCheckStatus, setTranslateCheckStatus] = useState("idle")
	const [translateFeedback, setTranslateFeedback] = useState(null)
	const selectedGameModeDetails =
		GAME_MODES.find((gameMode) => gameMode.id === selectedGameMode) || GAME_MODES[0]
	const isTranslateGame = selectedGameMode === "translate"
	const japaneseSentence = textPartsToString(elementsToTextParts(addedElements))
	const grammarStore = useGrammarStore((state) => state)
	const defaultElements = [
		{ text: "Nouns", list: nouns },
		{ text: "Verbs", list: verbs },
		{ text: "Adjectives", list: adjectives },
		{ text: "Adverbs", list: adverbs },
		{ text: "Counters", list: counters },
		{ text: "Punctuation", list: grammarStore.punctuation },
		{ text: "だ", list: [{ elementType: "desu", text: "だ", stem: "だ" }] },
	]
	const {
		dragState,
		getDragPreviewTransform,
		setElementDragNode,
		shouldSuppressElementClick,
		startElementPointerDrag,
	} = useSentenceDragDrop({
		elements: addedElements,
		setElements: setAddedElements,
		containerRef: sentenceElementsContainerRef,
		scale: sentenceElementsScale,
	})

	useEffect(() => {
		function handleMove(e) {
			setMouse({ x: e.clientX, y: e.clientY })
		}

		window.addEventListener("mousemove", handleMove)
		return () => window.removeEventListener("mousemove", handleMove)
	}, [])

	useLayoutEffect(() => {
		const container = sentenceElementsContainerRef.current
		if (!container) return

		function updateScale() {
			const availableWidth = Math.max(window.innerWidth - SENTENCE_ELEMENTS_VIEWPORT_PADDING * 2, 1)
			const contentWidth = Math.max(container.scrollWidth, 1)
			const nextScale = Math.min(1, availableWidth / contentWidth)

			if (Math.abs(sentenceElementsScaleRef.current - nextScale) < 0.005) return
			sentenceElementsScaleRef.current = nextScale
			setSentenceElementsScale(nextScale)
		}

		function scheduleScaleUpdate() {
			if (scaleFrameRef.current) {
				cancelAnimationFrame(scaleFrameRef.current)
			}

			scaleFrameRef.current = requestAnimationFrame(() => {
				scaleFrameRef.current = null
				updateScale()
			})
		}

		scheduleScaleUpdate()
		scaleTimeoutRef.current = window.setTimeout(scheduleScaleUpdate, 320)
		window.addEventListener("resize", scheduleScaleUpdate)

		return () => {
			if (scaleFrameRef.current) {
				cancelAnimationFrame(scaleFrameRef.current)
			}
			if (scaleTimeoutRef.current) {
				window.clearTimeout(scaleTimeoutRef.current)
			}
			window.removeEventListener("resize", scheduleScaleUpdate)
		}
	}, [addedElements])

	useEffect(() => {
		let pressedElement
		let hoveredElement

		function clearPressedElement() {
			pressedElement?.classList.remove("pressedElement")
			pressedElement = null
		}

		function clearHoveredElement() {
			hoveredElement?.classList.remove("hoverElement")
			hoveredElement = null
		}

		function handlePointerDown(e) {
			clearPressedElement()

			if (e.target.closest("input, button")) return

			pressedElement = e.target.closest(".baseInsideElement,.elementContainer,.addButton ")
			pressedElement?.classList.add("pressedElement")
		}

		function handlePointerOver(e) {
			//it would highlight the parent conjugation when hovering over menu
			if (e.target.closest(".elementOptionsMenuContainer")) return

			const element = e.target.closest(".baseInsideElement,.elementContainer,.addButton ")

			if (element === hoveredElement) return

			clearHoveredElement()

			if (element) {
				hoveredElement = element
				hoveredElement.classList.add("hoverElement")
			}
		}

		function handlePointerOut(e) {
			if (hoveredElement && !hoveredElement.contains(e.relatedTarget)) {
				clearHoveredElement()
			}
		}

		document.addEventListener("pointerdown", handlePointerDown)
		document.addEventListener("pointerup", clearPressedElement)
		document.addEventListener("pointercancel", clearPressedElement)

		document.addEventListener("pointerover", handlePointerOver)
		document.addEventListener("pointerout", handlePointerOut)

		return () => {
			clearPressedElement()
			clearHoveredElement()

			document.removeEventListener("pointerdown", handlePointerDown)
			document.removeEventListener("pointerup", clearPressedElement)
			document.removeEventListener("pointercancel", clearPressedElement)

			document.removeEventListener("pointerover", handlePointerOver)
			document.removeEventListener("pointerout", handlePointerOut)
		}
	}, [])

	useEffect(() => {
		if (!isTranslateGame) return

		let ignore = false

		async function loadTranslatePrompt() {
			setTranslatePromptStatus("loading")
			setTranslateFeedback(null)

			try {
				const response = await fetch("/api/v1/games/translate/prompt", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				})

				if (!response.ok) {
					throw new Error(`Prompt request failed with ${response.status}.`)
				}

				const data = await response.json()
				if (ignore) return

				setTranslatePrompt(data.sentence || "")
				setTranslatePromptStatus("ready")
			} catch (error) {
				console.log(error)
				if (ignore) return

				setTranslatePrompt("")
				setTranslatePromptStatus("error")
			}
		}

		loadTranslatePrompt()

		return () => {
			ignore = true
		}
	}, [isTranslateGame])

	useEffect(() => {
		setTranslateFeedback(null)
		setTranslateCheckStatus("idle")
	}, [japaneseSentence])

	function createSentenceElement(selectedElement) {
		return {
			...normalizeElement(selectedElement),
			sentenceElementId: nextElementId.current++,
		}
	}

	function addElement(index, selectedElement) {
		setAddedElements((prev) => {
			const copy = [...prev]
			copy.splice(index, 0, createSentenceElement(selectedElement))
			return copy
		})
	}

	function updateElement(elementId, newElement) {
		setAddedElements((prev) => {
			return prev.map((element) => {
				if (element.sentenceElementId !== elementId) return element

				return {
					...normalizeElement(newElement),
					sentenceElementId: elementId,
				}
			})
		})
	}

	function deleteElement(elementId) {
		setAddedElements((prev) => prev.filter((element) => element.sentenceElementId !== elementId))
	}

	function clearAllElements() {
		setAddedElements([])
	}

	function selectGameMode(gameMode) {
		setSelectedGameMode(gameMode)
		clearAllElements()
	}

	function logout() {
		setIsUserMenuOpen(false)
		onLogout()
	}

	async function checkTranslateAnswer() {
		if (!translatePrompt || !japaneseSentence || translateCheckStatus === "checking") return

		setTranslateCheckStatus("checking")
		setTranslateFeedback(null)

		try {
			const response = await fetch("/api/v1/games/translate/check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					englishSentence: translatePrompt,
					japaneseSentence,
				}),
			})

			if (!response.ok) {
				throw new Error(`Check request failed with ${response.status}.`)
			}

			const data = await response.json()
			setTranslateFeedback({
				correct: Boolean(data.correct),
				feedback: data.feedback || "",
			})
			setTranslateCheckStatus("ready")
		} catch (error) {
			console.log(error)
			setTranslateFeedback({
				correct: false,
				feedback: "Could not check the sentence right now. Try again in a moment.",
			})
			setTranslateCheckStatus("error")
		}
	}

	return (
		<div className="app">
			{currentUser ? (
				<div className="topRightUserMenu">
					<button
						type="button"
						className="topRightUserButton"
						aria-expanded={isUserMenuOpen}
						onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
					>
						{currentUser.displayName}
					</button>
					{isUserMenuOpen && (
						<div className="userDropdown" role="menu">
							<Link to="/account" role="menuitem">
								Account
							</Link>
							<button type="button" role="menuitem" onClick={logout}>
								Log out
							</button>
						</div>
					)}
				</div>
			) : (
				<nav className="topRightActions" aria-label="Account">
					<Link className="topRightButton" to="/login">
						Login
					</Link>
					<Link className="topRightButton topRightSignupButton" to="/signup">
						Sign up
					</Link>
				</nav>
			)}
			<div className="gameTabs" role="tablist" aria-label="Game modes">
				{GAME_MODES.map((gameMode) => (
					<button
						key={gameMode.id}
						type="button"
						role="tab"
						aria-selected={selectedGameMode === gameMode.id}
						className={`gameTab ${selectedGameMode === gameMode.id ? "gameTabSelected" : ""}`}
						onClick={() => selectGameMode(gameMode.id)}
					>
						{gameMode.id}
					</button>
				))}
			</div>
			<header className="gameModeDetails">
				<h1>{selectedGameModeDetails.title}</h1>
				<p>{selectedGameModeDetails.description}</p>
			</header>
			{isTranslateGame && (
				<section className="translateGamePanel" aria-live="polite">
					<div className="translatePromptLabel">English sentence</div>
					<div className="translatePromptText">
						{translatePromptStatus === "loading" && "Loading..."}
						{translatePromptStatus === "error" && "Could not load a sentence."}
						{translatePromptStatus === "ready" && translatePrompt}
					</div>
				</section>
			)}
			<SentenceText addedElements={addedElements} showTranslation={!isTranslateGame} />
			<div
				ref={sentenceElementsContainerRef}
				className={`sentenceElementsContainer ${dragState ? "sentenceElementsDragging" : ""}`}
				style={{ transform: `scale(${sentenceElementsScale})` }}
			>
				{addedElements.map((element, index) => {
					const isDraggingThis = dragState?.elementId === element.sentenceElementId
					const isDroppingThis = isDraggingThis && dragState?.isDropping
					const unscaledDragWidth = dragState?.width / sentenceElementsScale
					const unscaledDragHeight = dragState?.height / sentenceElementsScale
					return (
						<Fragment key={element.sentenceElementId}>
							<AddButton
								mouse={mouse}
								elementOptions={defaultElements}
								addElement={(selectedElement) => addElement(index, selectedElement)}
								text="word"
								disabled={Boolean(dragState)}
							/>
							<div
								ref={(node) => {
									setElementDragNode(element.sentenceElementId, node)
								}}
								className={`mainElementDragItem ${
									isDraggingThis ? "mainElementDragging" : ""
								} ${isDroppingThis ? "mainElementDropping" : ""}`}
								style={
									isDraggingThis
										? {
												width: unscaledDragWidth,
												height: unscaledDragHeight,
											}
										: {
												transform: getDragPreviewTransform(element.sentenceElementId, index),
											}
								}
								onPointerDown={(e) => startElementPointerDrag(e, element.sentenceElementId)}
								onClickCapture={(e) => {
									if (!shouldSuppressElementClick()) return
									e.preventDefault()
									e.stopPropagation()
								}}
							>
								<div
									className={`mainElementDragContent ${
										isDroppingThis ? "mainElementDragContentDropping" : ""
									}`}
									style={
										isDraggingThis
											? {
													position: "fixed",
													left: dragState.x,
													top: dragState.y,
													width: unscaledDragWidth,
													zIndex: 2000,
													pointerEvents: "none",
												}
											: undefined
									}
								>
									<Element
										element={element}
										mouse={mouse}
										addButtonsDisabled={Boolean(dragState)}
										updateElement={(newElement) =>
											updateElement(element.sentenceElementId, newElement)
										}
										deleteElement={() => deleteElement(element.sentenceElementId)}
										defaultElements={defaultElements}
									/>
								</div>
							</div>
							{index === addedElements.length - 1 && (
								<AddButton
									mouse={mouse}
									elementOptions={defaultElements}
									addElement={(element) => addElement(index + 1, element)}
									text="word"
									disabled={Boolean(dragState)}
								/>
							)}
						</Fragment>
					)
				})}
				{!addedElements.length && (
					<AddButton
						locked={true}
						mouse={mouse}
						elementOptions={defaultElements}
						addElement={(element) => addElement(0, element)}
						text="word"
						disabled={Boolean(dragState)}
					/>
				)}
			</div>
			<button
				type="button"
				className={`clearAllButton ${addedElements.length ? "clearAllButtonVisible" : ""}`}
				onClick={clearAllElements}
				disabled={!addedElements.length}
				aria-hidden={!addedElements.length}
			>
				Clear all
			</button>
			{isTranslateGame && addedElements.length > 0 && (
				<div className="translateCheckContainer">
					<button
						type="button"
						className="translateCheckButton"
						onClick={checkTranslateAnswer}
						disabled={
							!translatePrompt ||
							!japaneseSentence ||
							translatePromptStatus !== "ready" ||
							translateCheckStatus === "checking"
						}
					>
						{translateCheckStatus === "checking" ? "Checking..." : "Check"}
					</button>
					{translateFeedback && (
						<div
							className={`translateFeedback ${
								translateFeedback.correct
									? "translateFeedbackCorrect"
									: "translateFeedbackIncorrect"
							}`}
							role="status"
						>
							{translateFeedback.correct ? "Correct." : "Not quite."}
							{translateFeedback.feedback ? ` ${translateFeedback.feedback}` : ""}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
