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
