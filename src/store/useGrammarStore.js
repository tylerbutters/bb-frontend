import { create } from "zustand"
import {
	auxiliaries,
	conjugations,
	noDesu,
	particles,
	punctuation,
} from "../pages/sentence-builder-page/grammar/elementData"

const useGrammarStore = create(() => ({
	auxiliaries,
	particles,
	noDesu,
	conjugations,
	punctuation,
}))

export default useGrammarStore
