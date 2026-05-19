import { create } from "zustand"
import { auxiliaries, conjugations, noDesu, particles } from "./grammar/elementData"

const useElementsStore = create(() => ({
	auxiliaries,
	particles,
	noDesu,
	conjugations,
}))

export default useElementsStore
