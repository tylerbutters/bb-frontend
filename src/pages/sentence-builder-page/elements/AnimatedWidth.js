import { useEffect, useLayoutEffect, useRef, useState } from "react"

const WIDTH_TRANSITION_MS = 300

export default function AnimatedWidth({ measureKey, isClosing, onCloseComplete, children }) {
	const [width, setWidth] = useState(0)
	const [isAnimatingWidth, setIsAnimatingWidth] = useState(true)
	const contentRef = useRef(null)
	const hasMeasuredRef = useRef(false)
	const isOpeningRef = useRef(false)
	const hasClosedRef = useRef(false)
	const openingTimeoutRef = useRef(null)

	useLayoutEffect(() => {
		if (!contentRef.current) return

		const el = contentRef.current

		const measure = () => {
			if (isClosing) return
			const measuredWidth = el.scrollWidth

			if (!hasMeasuredRef.current) {
				hasMeasuredRef.current = true
				isOpeningRef.current = true
				setWidth(0)
				requestAnimationFrame(() => {
					setIsAnimatingWidth(true)
					setWidth(measuredWidth)
				})
				openingTimeoutRef.current = window.setTimeout(() => {
					isOpeningRef.current = false
					setIsAnimatingWidth(false)
					setWidth(el.scrollWidth)
				}, WIDTH_TRANSITION_MS + 20)
				return
			}

			if (isOpeningRef.current) return

			setIsAnimatingWidth(false)
			setWidth(measuredWidth)
		}
		measure()
		const observer = new ResizeObserver(() => {
			measure()
		})

		observer.observe(el)

		return () => {
			if (openingTimeoutRef.current) {
				window.clearTimeout(openingTimeoutRef.current)
			}
			observer.disconnect()
		}
	}, [measureKey, isClosing])

	useEffect(() => {
		if (isClosing) {
			setIsAnimatingWidth(true)
			requestAnimationFrame(() => {
				setWidth(0)
			})
		}
	}, [isClosing])

	return (
		<div
			style={{
				width,
				borderRadius: 10,
				overflow: isAnimatingWidth ? "hidden" : "visible",
				transition: isAnimatingWidth ? "width 0.3s ease" : "none",
			}}
			onTransitionEnd={(e) => {
				if (e.propertyName !== "width") return

				if (hasClosedRef.current) return

				if (isClosing) {
					hasClosedRef.current = true
					onCloseComplete()
				} else {
					isOpeningRef.current = false
					if (openingTimeoutRef.current) {
						window.clearTimeout(openingTimeoutRef.current)
						openingTimeoutRef.current = null
					}
					setIsAnimatingWidth(false)
				}
			}}
		>
			<div
				ref={contentRef}
				style={{
					display: "inline-block",
					whiteSpace: "nowrap",
				}}
			>
				{children}
			</div>
		</div>
	)
}
