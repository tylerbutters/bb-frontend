import { particles } from "./particleData"

function getParticleTextsForElementType(elementType) {
	return particles
		.filter((particle) => particle.attachesTo.includes(elementType))
		.map((particle) => particle.text)
}

describe("particles", () => {
	test("includes common particles that attach to desu", () => {
		expect(getParticleTextsForElementType("desu")).toEqual(
			expect.arrayContaining(["から", "が", "と", "か", "よ", "ね"]),
		)
	})
})
