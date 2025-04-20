"use client"

import { useLocalDark } from "./locals"
import { isBrowser } from "./isBrowser"
import invertLightness from "./color"

export const theme = {
	/**
	 * backgrounds for our cards
	 */
	cardBackground: "light-dark(#FBFBFB,red)",
	cardProminent: "light-dark(white,red)",
	cardHover: "light-dark(rgba(0, 0, 0, 0.06),red)",
	cardActive: "light-dark(rgba(0, 0, 0, 0.12),red)",

	/**
	 * foregrounds for our cards
	 */
	cardText: "light-dark(#000, black)",
	cardTextMuted: "light-dark(#444, black)",

	/**
	 * settings toggles
	 */
	controlHeadingBackground: "light-dark(rgb(155, 182, 255), red)",
	controlHeadingText: "light-dark(rgb(35, 40, 54), green)",
	controlNeutralFill: "light-dark(#FBFBFB, red)",
	controlNeutralStroke: "light-dark(rgb(75, 80, 95), red)",
	controlActiveFill: "light-dark(rgb(18, 38, 90), red)",

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
