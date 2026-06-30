import { useState } from "react"
import type {
	ChangeEvent,
	CSSProperties,
	FocusEventHandler,
	HTMLInputTypeAttribute,
	InputHTMLAttributes,
	KeyboardEventHandler,
} from "react"
import "./InputBox.css"
import { Eye, EyeOff } from "lucide-react"

interface InputBoxProps {
	autoComplete?: string
	className?: string
	fieldClassName?: string
	id?: string
	inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"]
	isPassword?: boolean
	label?: string
	name?: string
	onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void
	onFocus?: FocusEventHandler<HTMLInputElement>
	onKeyDown?: KeyboardEventHandler<HTMLInputElement>
	pattern?: string
	placeholder?: string
	required?: boolean
	style?: CSSProperties
	type?: HTMLInputTypeAttribute
	value?: string | number
}

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
}: InputBoxProps) {
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
