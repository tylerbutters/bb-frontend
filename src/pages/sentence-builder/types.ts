export interface ConjugationOption {
	text?: string
	stem?: string
	ending?: string
	baseEnding?: string
	conjugationType?: string
	detailId?: string
	followUpOptionsKey?: string
	replacesParent?: boolean
	conjugation?: ConjugationOption | Record<string, never>
	conjugationOptions?: ConjugationOption[]
	list?: ConjugationOption[]
	[key: string]: unknown
}

export interface SentenceElement {
	elementType?: string
	text?: string
	textKana?: string
	meanings?: string[]
	stem?: string
	stemKana?: string
	ending?: string
	baseEnding?: string
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
	ending?: string
	list?: MenuOption[]
	meanings?: string[]
	replacesParent?: boolean
	selectOption?: MenuOption
	selectedCategoryText?: string
	stem?: string
	text?: string
	textKana?: string
	[key: string]: unknown
}
