import { theme } from "app/utils/theme"
import { keyframes, styled } from "restyle"

export default function Spinner() {
	return (
		<Loader>
			<div />
			<div />
			<div />
			<div />
			<Bounce />
		</Loader>
	)
}

const Bounce = keyframes({
	"0%": {
		transform: "translateY(50px) rotate(-225deg)",
	},

	"50%": {
		transform: "translateY(-50px) rotate(45deg)",
	},

	"100%": {
		transform: "translateY(50px) rotate(-45deg)",
	},
})

const Loader = styled("div", {
	pointerEvents: "none",
	width: "100%",
	height: "250px",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	gap: "25px",

	div: {
		display: "inline-block",
		width: "40px",
		height: "40px",
		borderRadius: "8px",
		backgroundColor: "red",
		animation: `${Bounce} 2s infinite`,
		animationTimingFunction: "cubic-bezier(0.66, 0, 0.33, 1)",
	},

	"div:nth-child(1)": {
		background: theme.spinnerBlue,
		animationDelay: "0s",
	},

	"div:nth-child(2)": {
		background: theme.spinnerPink,
		animationDelay: "-1s",
	},

	"div:nth-child(3)": {
		background: theme.spinnerYellow,
		animationDelay: "-1.5s",
	},

	"div:nth-child(4)": {
		background: theme.spinnerGreen,
		animationDelay: "-0.5s",
	},
})
