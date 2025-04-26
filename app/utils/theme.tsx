"use client"

import { useLocalDark } from "./locals"
import { isBrowser } from "./isBrowser"
import invertLightness from "./color"

export const theme = {
	/**
	 * backgrounds for our cards
	 */
	cardBackground: "light-dark(#EBEFE7, #1C211C)",
	cardProminent: "light-dark(#DDE5DA, #414941)",
	cardHover: "light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.06))",
	cardActive: "light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.12))",

	/**
	 * foregrounds for our cards
	 */
	cardText: "light-dark(#181D18, #DFE4DC)",
	cardTextMuted: "light-dark(#414941, #C1C9BE)",

	/**
	 * settings toggles
	 */
	controlHeadingBackground: "light-dark(#B4F1BD, #18512B)",
	controlHeadingText: "light-dark(#18512B, #B4F1BD)",
	controlNeutralFill: "light-dark(#DFE4DC, #313631)",
	controlNeutralStroke: "light-dark(#717970, #8B9389)",
	controlActiveFill: "light-dark(#326941, #99D4A2)",
	controlActiveStroke: "light-dark(#fff, #003918)",

	/**
	 * misc
	 */
	loaderPulse: "light-dark(rgba(0, 0, 0, 0.08), red)",
	cardBoxShadow:
		"light-dark(0 4px 12px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(255, 255, 255, 1))",
}

const syncTheme = (value: "system" | "light" | "dark" | undefined) => {
	const themeValue = value || localStorage.getItem("dark") || "system"
	const systemValue = window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"

	document.body.style.setProperty(
		"color-scheme",
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

	return <script>{`(${syncTheme.toString()})()`}</script>
}

export const dynamicColor = (color: string) => {
	const parsed = invertLightness(color)

	return {
		backgroundColor: `light-dark(${parsed.lightColor}, ${parsed.darkColor})`,
		color: `light-dark(${parsed.darkColor}, ${parsed.lightColor})`,
	}
}
