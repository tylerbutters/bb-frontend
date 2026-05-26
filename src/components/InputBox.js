import { useState } from "react"
import "./InputBox.css"

export default function InputBox({
	autoComplete,
	className,
	fieldClassName,
	id,
	inputMode,
	isPassword = false,
	label,
	name,
	onChange,
	onFocus,
	onKeyDown,
	pattern,
	placeholder,
	required = false,
	style,
	type = "text",
	value,
}) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const inputType = isPassword ? (isPasswordVisible ? "text" : "password") : type
	const passwordLabel = label ? label.toLowerCase() : "password"
	const toggleLabel = `${isPasswordVisible ? "Hide" : "Show"} ${passwordLabel}`

	const input = (
		<input
			id={id}
			name={name}
			type={inputType}
			className={className}
			style={style}
			value={value}
			onChange={(e) => onChange(e.target.value, e)}
			onFocus={onFocus}
			onKeyDown={onKeyDown}
			autoComplete={autoComplete}
			inputMode={inputMode}
			pattern={pattern}
			placeholder={placeholder}
			required={required}
		/>
	)

	const inputControl = isPassword ? (
		<div className="passwordInputWrap">
			{input}
			<button
				type="button"
				className="passwordToggleButton"
				aria-label={toggleLabel}
				aria-pressed={isPasswordVisible}
				onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
			>
				{isPasswordVisible ? "Hide" : "Show"}
			</button>
		</div>
	) : (
		input
	)

	if (!label) return inputControl

	return (
		<label className={fieldClassName} htmlFor={id}>
			<span>{label}</span>
			{inputControl}
		</label>
	)
}
