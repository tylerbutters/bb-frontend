import type { ReactElement, ReactNode } from "react"

interface JapaneseTextProps {
	text?: ReactNode
	reading?: ReactNode
}

export default function JapaneseText({ text, reading }: JapaneseTextProps): ReactElement {
	if (!reading || !text || reading === text) return <>{text}</>

	return (
		<ruby>
			{text}
			<rt>{reading}</rt>
		</ruby>
	)
}
