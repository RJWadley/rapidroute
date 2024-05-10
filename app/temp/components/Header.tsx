"use client"

import { runImport } from "temp/updater"
import { styled } from "@linaria/react"
import Logo from "assets/images/global/RapidRouteLogo.svg"

// import UniversalLink from "utils/Loader/UniversalLink"
import media from "../utils/media"
import UniversalLink from "./UniversalLink"

// TODO finish import
// import Settings from "./Settings"

export default function Header() {
	return (
		<Wrapper>
			<LogoWrapper href="/">
				<StyledLogo />
				<Text>
					<div>
						<Strong>MRT</Strong>&nbsp;Rapidroute
					</div>
					<Colors>
						<div />
						<div />
						<div />
						<div />
					</Colors>
				</Text>
				<UniversalLink
					type="button"
					onClick={() => {
						runImport().catch(console.error)
					}}
				>
					import
				</UniversalLink>
			</LogoWrapper>
			{/* <Settings /> */}
		</Wrapper>
	)
}

const Wrapper = styled.div`
	position: relative;
	display: flex;
	justify-content: space-between;
	padding: 20px;
	height: 90px;
`

const LogoWrapper = styled.a`
	display: flex;
	align-items: center;
	gap: 20px;
	cursor: pointer;

	@media ${media.mobile} {
		gap: 5px;
		margin-left: 10px;
	}
`

const StyledLogo = styled(Logo)`
	height: 40px;

	@media ${media.mobile} {
		height: 30px;
		transform: translate(0, -2px);
	}
`

const Text = styled.div`
	font-size: var(--medium);
	margin-bottom: 10px;
`

const Strong = styled.strong`
	font-weight: 700;
`

const Colors = styled.div`
	height: 3px;
	width: 75px;
	display: flex;
	border-radius: 3px;
	overflow: hidden;

	div {
		height: 100%;
		width: 25%;
	}

	div:nth-child(1) {
		background-color: var(--rapid-blue);
	}

	div:nth-child(2) {
		background-color: var(--rapid-red);
	}

	div:nth-child(3) {
		background-color: var(--rapid-yellow);
	}

	div:nth-child(4) {
		background-color: var(--rapid-green);
	}

	@media ${media.mobile} {
		width: 65px;
		height: 2px;
	}
`
