export interface ConjugationOption {
	text?: string | null
	stem?: string | null
	ending?: string | null
	baseEnding?: string | null
	conjugationType?: string
	detailId?: string
	followUpOptionsKey?: string
	replacesParent?: boolean
	conjugation?: ConjugationOption | Record<string, never> | null
	conjugationOptions?: ConjugationOption[]
	list?: ConjugationOption[]
	[key: string]: unknown
}

export interface SentenceElement {
	elementType?: string
	text?: string | null
	textKana?: string | null
	meanings?: string[]
	stem?: string | null
	stemKana?: string | null
	ending?: string | null
	baseEnding?: string | null
	adjectiveType?: string
	verbType?: string
	number?: string | number | null
	conjugation?: ConjugationOption | null
	conjugationOptions?: ConjugationOption[]
	prefix?: MenuOption | null
	suffix?: MenuOption | null
	noDesu?: SentenceElement | null
	particle?: SentenceElement | null
	sentenceElementId?: number
	isGeneratedPromptElement?: boolean
	[key: string]: unknown
}

export interface ElementOption extends SentenceElement {
	text: string
}

export interface ParticleOption {
	text: string
	attachesTo: string[]
}

export interface MousePosition {
	x: number
	y: number
}

export interface ElementTypeColor {
	primary: string
	secondary: string
}

export interface ElementColorSet {
	noun: ElementTypeColor
	adjective: ElementTypeColor
	verb: ElementTypeColor
	adverb: ElementTypeColor
	counter: ElementTypeColor
	desu: ElementTypeColor
	punctuation: ElementTypeColor
	default: ElementTypeColor
}

export interface ElementComponentProps {
	element: SentenceElement
	updateElement: (element: SentenceElement) => void
	deleteElement: () => void
	mouse: MousePosition
	allColors: ElementColorSet
	addButtonsDisabled?: boolean
	affixesDisabled?: boolean
	conjugationDisabled?: boolean
	counterDisabled?: boolean
	elementOptions?: MenuOption[]
}

export interface MenuOption {
	attachesTo?: string[]
	conjugationOptions?: MenuOption[]
	conjugationType?: string
	detailId?: string
	elementType?: string
	ending?: string | null
	list?: MenuOption[]
	meanings?: string[]
	replacesParent?: boolean
	selectOption?: MenuOption
	selectedCategoryText?: string
	stem?: string | null
	text?: string | null
	textKana?: string | null
	[key: string]: unknown
}
