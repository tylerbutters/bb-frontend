import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "../App.css"
import JapaneseText from "./JapaneseText"

const MENU_TRANSITION_MS = 160
const MENU_OPEN_EVENT = "element-options-menu-open"
const MENU_VIEWPORT_PADDING = 16
const MENU_ANCHOR_GAP = 10
const MENU_PANEL_GAP = 8
const MENU_PANEL_WIDTH = 300

function clamp(value, min, max) {
	if (max < min) return min
	return Math.min(max, Math.max(min, value))
}

function getPanelWidth() {
	if (typeof window === "undefined") return MENU_PANEL_WIDTH

	const availableWidth = window.innerWidth - MENU_VIEWPORT_PADDING * 2
	const maxPanelWidth = (availableWidth - MENU_PANEL_GAP) / 2

	return Math.max(0, Math.min(MENU_PANEL_WIDTH, maxPanelWidth))
}

function getSecondaryPlacement(layout) {
	return layout?.secondaryPlacement ?? "right"
}

function getMenuLeft(layout, secondaryPlacement) {
	if (!layout) return 0
	if (secondaryPlacement === "left") {
		return layout.primaryLeft - layout.panelWidth - MENU_PANEL_GAP
	}

	return layout.primaryLeft
}

const KANA_ROMAJI = {
	あ: "a",
	い: "i",
	う: "u",
	え: "e",
	お: "o",
	か: "ka",
	き: "ki",
	く: "ku",
	け: "ke",
	こ: "ko",
	さ: "sa",
	し: "shi",
	す: "su",
	せ: "se",
	そ: "so",
	た: "ta",
	ち: "chi",
	つ: "tsu",
	て: "te",
	と: "to",
	な: "na",
	に: "ni",
	ぬ: "nu",
	ね: "ne",
	の: "no",
	は: "ha",
	ひ: "hi",
	ふ: "fu",
	へ: "he",
	ほ: "ho",
	ま: "ma",
	み: "mi",
	む: "mu",
	め: "me",
	も: "mo",
	や: "ya",
	ゆ: "yu",
	よ: "yo",
	ら: "ra",
	り: "ri",
	る: "ru",
	れ: "re",
	ろ: "ro",
	わ: "wa",
	ゐ: "wi",
	ゑ: "we",
	を: "wo",
	ん: "n",
	が: "ga",
	ぎ: "gi",
	ぐ: "gu",
	げ: "ge",
	ご: "go",
	ざ: "za",
	じ: "ji",
	ず: "zu",
	ぜ: "ze",
	ぞ: "zo",
	だ: "da",
	ぢ: "ji",
	づ: "zu",
	で: "de",
	ど: "do",
	ば: "ba",
	び: "bi",
	ぶ: "bu",
	べ: "be",
	ぼ: "bo",
	ぱ: "pa",
	ぴ: "pi",
	ぷ: "pu",
	ぺ: "pe",
	ぽ: "po",
	ぁ: "a",
	ぃ: "i",
	ぅ: "u",
	ぇ: "e",
	ぉ: "o",
	ゃ: "ya",
	ゅ: "yu",
	ょ: "yo",
	ゎ: "wa",
	ゔ: "vu",
}

const KANA_COMBO_ROMAJI = {
	きゃ: "kya",
	きゅ: "kyu",
	きょ: "kyo",
	ぎゃ: "gya",
	ぎゅ: "gyu",
	ぎょ: "gyo",
	しゃ: "sha",
	しゅ: "shu",
	しょ: "sho",
	じゃ: "ja",
	じゅ: "ju",
	じょ: "jo",
	ちゃ: "cha",
	ちゅ: "chu",
	ちょ: "cho",
	ぢゃ: "ja",
	ぢゅ: "ju",
	ぢょ: "jo",
	にゃ: "nya",
	にゅ: "nyu",
	にょ: "nyo",
	ひゃ: "hya",
	ひゅ: "hyu",
	ひょ: "hyo",
	びゃ: "bya",
	びゅ: "byu",
	びょ: "byo",
	ぴゃ: "pya",
	ぴゅ: "pyu",
	ぴょ: "pyo",
	みゃ: "mya",
	みゅ: "myu",
	みょ: "myo",
	りゃ: "rya",
	りゅ: "ryu",
	りょ: "ryo",
	ふぁ: "fa",
	ふぃ: "fi",
	ふぇ: "fe",
	ふぉ: "fo",
	うぃ: "wi",
	うぇ: "we",
	うぉ: "wo",
	ゔぁ: "va",
	ゔぃ: "vi",
	ゔぇ: "ve",
	ゔぉ: "vo",
	てぃ: "ti",
	でぃ: "di",
	とぅ: "tu",
	どぅ: "du",
}

const SEARCH_TEXT_CACHE = new WeakMap()

function normalizeSearchValue(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
}

function toHiragana(text = "") {
	return text.replace(/[\u30a1-\u30f6]/g, (char) =>
		String.fromCharCode(char.charCodeAt(0) - 0x60),
	)
}

function getLastVowel(text) {
	const match = text.match(/[aeiou](?!.*[aeiou])/)
	return match?.[0] || ""
}

function getNextRomanSyllable(kana, index) {
	return KANA_COMBO_ROMAJI[kana.slice(index, index + 2)] || KANA_ROMAJI[kana[index]] || ""
}

function kanaToRomaji(text = "") {
	const kana = toHiragana(text)
	let romaji = ""

	for (let i = 0; i < kana.length; i++) {
		const char = kana[i]

		if (char === "っ") {
			const nextSyllable = getNextRomanSyllable(kana, i + 1)
			romaji += nextSyllable.match(/^[bcdfghjklmnpqrstvwxyz]/)?.[0] || ""
			continue
		}

		if (char === "ー") {
			romaji += getLastVowel(romaji)
			continue
		}

		const combo = KANA_COMBO_ROMAJI[kana.slice(i, i + 2)]
		if (combo) {
			romaji += combo
			i++
			continue
		}

		romaji += KANA_ROMAJI[char] || char
	}

	return romaji
}

function getRomajiSearchValues(value) {
	const romaji = kanaToRomaji(value)
	const shortVowels = romaji.replace(/([aeiou])\1+/g, "$1")

	return romaji === shortVowels ? [romaji] : [romaji, shortVowels]
}

function getOptionSearchText(element) {
	if (!element || typeof element !== "object") return ""

	const cachedSearchText = SEARCH_TEXT_CACHE.get(element)
	if (cachedSearchText) return cachedSearchText

	const textValues = [element.text, element.textKana, ...(element.meanings || [])]
	const romajiValues = [element.text, element.textKana].flatMap(getRomajiSearchValues)
	const searchText = [...textValues, ...romajiValues]
		.filter(Boolean)
		.map(normalizeSearchValue)
		.join(" ")

	SEARCH_TEXT_CACHE.set(element, searchText)
	return searchText
}

function matchesSearch(element, searchText) {
	const query = normalizeSearchValue(searchText)
	if (!query) return false

	return getOptionSearchText(element).includes(query)
}

export default function ElementOptionsMenu({
	anchorRef,
	isModalOpen,
	setIsModalOpen,
	onSelect,
	elementOptions,
	deleteElement,
	hasSearch = false,
	hasDelete,
	menuTitle,
}) {
	const modalRef = useRef(null)
	const menuIdRef = useRef(Symbol("element-options-menu"))
	const [shouldRenderMenu, setShouldRenderMenu] = useState(isModalOpen)
	const [selectedCategory, setSelectedCategory] = useState()
	const [secondaryElementOptions, setSecondaryElementOptions] = useState([])
	const [menuLayout, setMenuLayout] = useState(null)

	const closeMenu = useCallback(() => {
		setIsModalOpen(false)
	}, [setIsModalOpen])

	const updateMenuLayout = useCallback(() => {
		const anchor = anchorRef?.current
		if (!anchor) return

		const anchorRect = anchor.getBoundingClientRect()
		const panelWidth = getPanelWidth()
		const menuHeight = modalRef.current?.getBoundingClientRect().height || 0
		const anchorCenter = anchorRect.left + anchorRect.width / 2
		const naturalPrimaryLeft = anchorCenter - panelWidth / 2
		const totalWidth = panelWidth * 2 + MENU_PANEL_GAP
		const canRenderSecondaryOnRight =
			naturalPrimaryLeft + totalWidth <= window.innerWidth - MENU_VIEWPORT_PADDING
		const secondaryPlacement = canRenderSecondaryOnRight ? "right" : "left"
		const primaryLeft =
			secondaryPlacement === "right"
				? clamp(
						naturalPrimaryLeft,
						MENU_VIEWPORT_PADDING,
						window.innerWidth - MENU_VIEWPORT_PADDING - totalWidth,
					)
				: clamp(
						naturalPrimaryLeft,
						MENU_VIEWPORT_PADDING + panelWidth + MENU_PANEL_GAP,
						window.innerWidth - MENU_VIEWPORT_PADDING - panelWidth,
					)

		const nextLayout = {
			panelWidth,
			primaryLeft,
			secondaryPlacement,
			top: anchorRect.top - MENU_ANCHOR_GAP - menuHeight,
		}

		setMenuLayout((currentLayout) => {
			if (
				currentLayout &&
				Math.abs(currentLayout.primaryLeft - nextLayout.primaryLeft) < 0.5 &&
				Math.abs(currentLayout.top - nextLayout.top) < 0.5 &&
				Math.abs(currentLayout.panelWidth - nextLayout.panelWidth) < 0.5 &&
				currentLayout.secondaryPlacement === nextLayout.secondaryPlacement
			) {
				return currentLayout
			}

			return nextLayout
		})
	}, [anchorRef])

	useEffect(() => {
		if (isModalOpen) {
			setMenuLayout(null)
			setShouldRenderMenu(true)
			window.dispatchEvent(
				new CustomEvent(MENU_OPEN_EVENT, {
					detail: menuIdRef.current,
				}),
			)
			return
		}

		const timeout = setTimeout(() => {
			setShouldRenderMenu(false)
			setSelectedCategory(null)
			setMenuLayout(null)
		}, MENU_TRANSITION_MS)

		return () => clearTimeout(timeout)
	}, [isModalOpen])

	useEffect(() => {
		function handleOtherMenuOpen(e) {
			if (e.detail === menuIdRef.current) return
			closeMenu()
		}

		window.addEventListener(MENU_OPEN_EVENT, handleOtherMenuOpen)
		return () => window.removeEventListener(MENU_OPEN_EVENT, handleOtherMenuOpen)
	}, [closeMenu])

	useEffect(() => {
		function handleClickOutside(e) {
			if (anchorRef?.current?.contains(e.target)) return
			if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
				closeMenu()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [anchorRef, closeMenu, isModalOpen])

	useLayoutEffect(() => {
		if (!shouldRenderMenu || menuLayout) return

		updateMenuLayout()
	}, [menuLayout, shouldRenderMenu, updateMenuLayout])

	function handleSelectOption(selectedElement, categoryText) {
		onSelect(
			categoryText
				? {
						...selectedElement,
						selectedCategoryText: categoryText,
					}
				: selectedElement,
		)
		closeMenu()
	}

	function handleSelectCategory(selectedElement) {
		if (
			selectedElement.list?.length === 1 &&
			selectedElement.list[0].text === selectedElement.text
		) {
			handleSelectOption(selectedElement.list[0])
		} else if (!selectedElement.list) {
			handleSelectOption(selectedElement)
		} else {
			setSelectedCategory(selectedElement.text)
			setSecondaryElementOptions(selectedElement.list)
		}
	}

	function handleDelete() {
		closeMenu()
		deleteElement()
	}

	if (!shouldRenderMenu) return null

	const panelWidth = menuLayout?.panelWidth ?? getPanelWidth()
	const secondaryPlacement = selectedCategory ? getSecondaryPlacement(menuLayout) : "right"
	const menuLeft = getMenuLeft(menuLayout, secondaryPlacement)
	const secondaryPanel = selectedCategory && (
		<ElementOptionsPanel className="secondaryElementOptionsPanel" menuTitle={selectedCategory}>
			<ElementOptionsList
				hasSearch={true}
				elementOptions={secondaryElementOptions}
				onSelectOption={(selectedElement) => handleSelectOption(selectedElement, selectedCategory)}
			/>
		</ElementOptionsPanel>
	)
	const primaryPanel = (
		<ElementOptionsPanel hasDelete={hasDelete} onDelete={handleDelete} menuTitle={menuTitle}>
			<ElementOptionsList
				hasSearch={hasSearch}
				elementOptions={elementOptions}
				selectedCategory={selectedCategory}
				onSelectOption={handleSelectCategory}
			/>
		</ElementOptionsPanel>
	)

	const menu = (
		<div
			ref={modalRef}
			className={`elementOptionsMenuContainer ${
				isModalOpen ? "elementOptionsMenuOpen" : "elementOptionsMenuClosing"
			}`}
			style={{
				left: `${menuLeft}px`,
				top: `${menuLayout?.top ?? 0}px`,
				visibility: menuLayout ? undefined : "hidden",
				"--element-options-panel-width": `${panelWidth}px`,
			}}
		>
			{secondaryPlacement === "left" && secondaryPanel}
			{primaryPanel}
			{secondaryPlacement === "right" && secondaryPanel}
		</div>
	)

	return createPortal(menu, document.body)
}

const PAGE_SIZE = 50

function ElementOptionsPanel({ children, hasDelete, onDelete, className = "", menuTitle }) {
	return (
		<div className={`elementListContainer ${className}`}>
			{menuTitle && <div className="elementOptionsMenuTitle">{menuTitle}</div>}
			{children}
			{hasDelete && (
				<div className="deleteElementButtonContainer">
					<button
						type="button"
						className="elementOptionsMenuButton deleteElementButton"
						onClick={onDelete}
					>
						Delete
					</button>
				</div>
			)}
		</div>
	)
}

function ElementOptionsList({ hasSearch, elementOptions = [], onSelectOption, selectedCategory }) {
	const [searchText, setSearchText] = useState("")
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const sentinelRef = useRef(null)
	const filteredOptions = useMemo(() => {
		if (!hasSearch) return elementOptions
		if (!searchText) return []
		return elementOptions.filter((element) => matchesSearch(element, searchText))
	}, [elementOptions, hasSearch, searchText])

	const visibleOptions = useMemo(() => {
		return filteredOptions?.slice(0, visibleCount) || []
	}, [filteredOptions, visibleCount])

	useEffect(() => {
		setVisibleCount(PAGE_SIZE)
	}, [searchText, elementOptions])

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0]
				if (target.isIntersecting) {
					setVisibleCount((prev) => prev + PAGE_SIZE)
				}
			},
			{
				root: null,
				rootMargin: "100px",
				threshold: 0,
			},
		)
		const node = sentinelRef.current
		if (node) observer.observe(node)
		return () => {
			if (node) observer.unobserve(node)
			observer.disconnect()
		}
	}, [])

	function getVisibleMeaningsText(element) {
		return element?.meanings?.slice(0, 3).join("; ")
	}

	function getMeaningsTitle(element) {
		return element?.meanings?.join("; ")
	}

	return (
		<>
			{hasSearch && (
				<div className="searchInputContainer">
					<input
						type="text"
						className="searchInput"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						placeholder="Search..."
					/>
				</div>
			)}
			<div
				className="elementListItemContainer"
				style={{ height: hasSearch && 300, width: hasSearch && 250 }}
			>
				{visibleOptions.map((element, index) => (
					<button
						type="button"
						key={index}
						className={`elementOptionsMenuButton ${
							selectedCategory === element?.text && "selectedElementOptionsMenuButton"
						}`}
						onClick={() => onSelectOption(element)}
						title={getMeaningsTitle(element)}
					>
						<div className="elementOptionsMenuButtonText">
							<JapaneseText text={element?.text} reading={element?.textKana} />
						</div>

						{element?.meanings?.length > 0 && (
							<span className="elementOptionsMenuButtonMeanings">
								{getVisibleMeaningsText(element)}
							</span>
						)}
					</button>
				))}
				<div ref={sentinelRef} style={{ height: 1 }} />
			</div>
		</>
	)
}
