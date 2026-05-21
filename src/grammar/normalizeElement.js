export default function normalizeElement(element) {
	if (element.elementType === "verb" && !element.conjugation) {
		return {
			...element,
			conjugation: {
				stem: element?.ending,
			},
		}
	}

	if (
		element.elementType === "adjective" &&
		element.adjectiveType === "i-type" &&
		!element.conjugation
	) {
		return {
			...element,
			conjugation: {
				stem: element?.ending,
			},
		}
	}

	if (element.elementType === "desu" && !element.conjugation) {
		return {
			...element,
			conjugation: {
				stem: element?.stem,
			},
		}
	}

	if (element.elementType === "counter" && element.number.length === 0) {
		return {
			...element,
			number: "0",
		}
	}

	return element
}
