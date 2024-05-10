import media from "(temp)/utils/media"
import { styled } from "@linaria/react"

import type { UniversalLinkProps } from "./UniversalLink"
import UniversalLink from "./UniversalLink"

type RoundButtonProps = UniversalLinkProps & {
	flipped?: boolean
}

export default function RoundButton({
	children,
	flipped = false,
	...props
}: RoundButtonProps) {
	return (
		<StyledButton flipped={flipped} {...props}>
			<div>{children}</div>
		</StyledButton>
	)
}

const StyledButton = styled(UniversalLink)<{ flipped: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--button-green);

	div,
	svg {
		height: 100%;
		width: 100%;
	}

	path {
		fill: var(--invert-button-green);
	}

	width: 80px;
	height: 80px;
	border-radius: 20px;
	overflow: clip;
	padding: 10px;

	@media ${media.mobile} {
		width: 50px;
		height: 50px;
		border-radius: 15px;
	}
`
