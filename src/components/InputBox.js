import { useState } from "react"
import "./InputBox.css"
import { Eye, EyeOff } from "lucide-react"

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
	const inputStyle = isPassword ? { ...style, paddingRight: 40 } : style
	const containerClassName = `inputBoxContainer ${fieldClassName || ""}`.trim()
	const inputClassName = `inputContainer ${className || ""}`.trim()
	const passwordToggleLabel = label
		? `${isPasswordVisible ? "Hide" : "Show"} ${label.toLowerCase()}`
		: `${isPasswordVisible ? "Hide" : "Show"} password`

	return (
		<label className={containerClassName} htmlFor={id}>
			{label && <span>{label}</span>}
			<div className="passwordInputWrap">
				<input
					id={id}
					name={name}
					className={inputClassName}
					style={inputStyle}
					type={inputType}
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
				{isPassword && (
					<button
						type="button"
						className="passwordToggleButton"
						aria-label={passwordToggleLabel}
						aria-pressed={isPasswordVisible}
						onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
					>
						{isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
				)}
			</div>
		</label>
	)
}
