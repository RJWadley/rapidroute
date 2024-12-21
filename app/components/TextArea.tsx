import { styled } from "@linaria/react"
import {
	forwardRef,
	useState,
	type ComponentPropsWithoutRef,
	type ForwardRefRenderFunction,
} from "react"

const TextAreaFunction: ForwardRefRenderFunction<
	HTMLTextAreaElement,
	ComponentPropsWithoutRef<"textarea">
> = ({ className, value, defaultValue, onChange, ...props }, forwardedRef) => {
	const [internalValue, setValue] = useState(value ?? defaultValue)

	const displayValue = value ?? internalValue

	return (
		<Wrapper className={className}>
			<Sizer>{displayValue}</Sizer>
			<Element
				rows={1}
				ref={forwardedRef}
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

const Wrapper = styled.div`
	display: grid;

	>*{
		grid-area: 1/1/2/2;
	}
`

const Sizer = styled.div`
    white-space: break-spaces;
    word-break: break-word;
	visibility: hidden;
`

const Element = styled.textarea`
    white-space: break-spaces;
	width: 100%;
	height: 100%;
	border: none;
	outline: none;
	padding: 0;
	resize: none;
	background: transparent;
`

export const TextArea = forwardRef(TextAreaFunction)
