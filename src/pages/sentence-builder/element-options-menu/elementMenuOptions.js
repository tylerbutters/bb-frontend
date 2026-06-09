export function normalizeElementMenuOptions(elementOptions = []) {
	return elementOptions.map(normalizeElementMenuOption)
}

export function getSelectableOption(option) {
	if (!option) return null
	if (option.selectOption) return option.selectOption
	if (!option.list) return option
	return null
}

export function getDetailOption(option) {
	return getSelectableOption(option) || option
}

export function optionOpensSubmenu(option) {
	return Array.isArray(option?.list) && !getSelectableOption(option)
}

function normalizeElementMenuOption(option) {
	if (!option || typeof option !== "object") return option

	const normalizedOption = {
		...option,
	}

	if (Array.isArray(option.list)) {
		normalizedOption.list = option.list.map(normalizeElementMenuOption)
	}

	if (!normalizedOption.selectOption && hasImplicitDirectSelectOption(normalizedOption)) {
		// Older menu data used a one-item child list to mean "select this child
		// directly". Normalize that shape so the interaction code can read the
		// intent instead of re-checking list length and duplicate text.
		normalizedOption.selectOption = normalizedOption.list[0]
	}

	return normalizedOption
}

function hasImplicitDirectSelectOption(option) {
	return option.list?.length === 1 && option.list[0]?.text === option.text
}
