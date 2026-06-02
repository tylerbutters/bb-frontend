export default function JapaneseText({ text, reading }) {
	if (!reading || !text || reading === text) return text

	return (
		<ruby>
			{text}
			<rt>{reading}</rt>
		</ruby>
	)
}
