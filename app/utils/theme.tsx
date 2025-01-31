import { useLocalDark } from "./locals"
import { isBrowser } from "./isBrowser"
import { GlobalStyles } from "restyle"
import invertLightness from "./color"

const colors = {
	/**
	 * backgrounds
	 */
	cardBackground: {
		variable: "--card-background",
		light: "#FBFBFB",
		dark: "red",
	},
	cardProminent: {
		variable: "--card-prominent",
		light: "white",
		dark: "red",
	},
	cardHover: {
		variable: "--card-hover",
		light: "rgba(0, 0, 0, 0.06)",
		dark: "red",
	},
	cardActive: {
		variable: "--card-active",
		light: "rgba(0, 0, 0, 0.12)",
		dark: "red",
	},
	/**
	 * foregrounds
	 */
	cardText: {
		variable: "--card-text",
		light: "#000",
		dark: "black",
	},
	cardTextMuted: {
		variable: "--card-text-muted",
		light: "#444",
		dark: "black",
	},
	/**
	 * settings
	 */
	controlHeadingBackground: {
		variable: "--control-heading-background",
		light: "rgb(155, 182, 255)",
		dark: "red",
	},
	controlHeadingText: {
		variable: "--control-heading-text",
		light: "rgb(35, 40, 54)",
		dark: "green",
	},
	controlNeutralFill: {
		variable: "--control-neutral-fill",
		light: "#FBFBFB",
		dark: "red",
	},
	controlNeutralStroke: {
		variable: "--control-neutral-stroke",
		light: "rgb(75, 80, 95)",
		dark: "red",
	},
	controlActiveFill: {
		variable: "--control-active-fill",
		light: "rgb(18, 38, 90)",
		dark: "red",
	},

	/**
	 * effects
	 */
	cardBoxShadow: {
		variable: "--card-shadow",
		light: "0 4px 12px rgba(0, 0, 0, 0.12)",
		dark: "0 4px 12px rgba(255, 255, 255, 1)",
	},
	loaderPulse: {
		variable: "--loader-pulse",
		light: "rgba(0, 0, 0, 0.08)",
		dark: "red",
	},
} as const

const darkVariables = Object.fromEntries(
	Object.entries(colors).map(([key, value]) => [value.variable, value.dark]),
)
const lightVariables = Object.fromEntries(
	Object.entries(colors).map(([key, value]) => [value.variable, value.light]),
)

export const theme = Object.fromEntries(
	Object.entries(colors).map(([key, value]) => [
		key,
		`var(${value.variable}, light-dark(${value.light}, ${value.dark}))`,
	]),
) as {
	[key in keyof typeof colors]: `var(${(typeof colors)[key]["variable"]}, light-dark(${(typeof colors)[key]["light"]}, ${(typeof colors)[key]["dark"]}))`
}

const syncTheme = (value: "system" | "light" | "dark" | undefined) => {
	const themeValue = value || localStorage.getItem("dark") || "system"
	const systemValue = window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"
	document.body.setAttribute(
		"data-theme",
		themeValue === "dark"
			? "dark"
			: themeValue === "light"
				? "light"
				: systemValue,
	)
}

export const SetupTheme = () => {
	const [{ preference }] = useLocalDark()
	if (isBrowser && preference) {
		syncTheme(preference)
	}

	return (
		<>
			<script>{`
				(${syncTheme.toString()})()
			`}</script>
			<GlobalStyles>
				{{
					lightVariables,
					'body[data-theme="light"]': lightVariables,
					'body[data-theme="dark"]': darkVariables,
				}}
			</GlobalStyles>
		</>
	)
}

export const dynamicColor = (color: string) => {
	const parsed = invertLightness(color)

	return {
		'body[data-theme="light"] &': {
			backgroundColor: parsed.lightColor,
			color: parsed.darkColor,
		},
		'body[data-theme="dark"] &': {
			backgroundColor: parsed.darkColor,
			color: parsed.lightColor,
		},
	}
}
