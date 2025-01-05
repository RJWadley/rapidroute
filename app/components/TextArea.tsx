import { type ComponentProps, useState } from "react"
import { styled } from "restyle"

export const TextArea = ({
	ref,
	className,
	value,
	defaultValue,
	onChange,
	...props
}: ComponentProps<"textarea">) => {
	const [internalValue, setValue] = useState(value ?? defaultValue)

	const displayValue = value ?? internalValue

	return (
		<Wrapper className={className}>
			<Sizer>{displayValue}</Sizer>
			<Element
				rows={1}
				ref={ref}
				value={displayValue}
				onChange={(e) => {
					setValue(e.target.value)
					onChange?.(e)
				}}
				{...props}
			/>
		</Wrapper>
	)
}

const Wrapper = styled("div", {
	display: "grid",

	"& > *": {
		gridArea: "1/1/2/2",
	},
})

const Sizer = styled("div", {
	whiteSpace: "break-spaces",
	wordBreak: "break-word",
	visibility: "hidden",
})

const Element = styled("textarea", {
	whiteSpace: "break-spaces",
	width: "100%",
	height: "100%",
	border: "none",
	outline: "none",
	padding: 0,
	resize: "none",
	background: "transparent",
})
