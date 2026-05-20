import { create } from "zustand"
import { auxiliaries, conjugations, noDesu, particles } from "../grammar/elementData"

const useGrammarStore = create(() => ({
	auxiliaries,
	particles,
	noDesu,
	conjugations,
}))

export default useGrammarStore
