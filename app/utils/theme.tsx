import { useLocalDark } from "./locals"
import { isBrowser } from "./isBrowser"
import { GlobalStyles } from "restyle"

const colors = {
	cardBackground: {
		variable: "--card-background",
		light: "#eee",
		dark: "#222",
	},
	cardText: {
		variable: "--card-text",
		light: "#000",
		dark: "#fff",
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

const syncTheme = () => {
	const theme = document.cookie
		.split("; ")
		.find((row) => row.startsWith("dark="))
	const themeValue = theme?.split("=")[1] || "system"
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
	const [{ isDark, preference }] = useLocalDark()
	if (isBrowser && preference && isDark !== null) {
		syncTheme()
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
