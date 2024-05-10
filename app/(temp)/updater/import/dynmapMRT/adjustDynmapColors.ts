import { darken, getContrast, getLuminance, lighten, toHex } from "color2k"

export const getBothColors = (baseColor: string) => {
	const darkBackground = adjustContrast(baseColor, "#ffffff")
	const lightBackground = adjustContrast(baseColor, "#000000")

	return {
		light: toHex(lightBackground),
		dark: toHex(darkBackground),
	}
}

function adjustContrast(background: string, text: string): string {
	const contrastThreshold = 8

	const backgroundLuminance = getLuminance(background)
	const textLuminance = getLuminance(text)
	const contrast = getContrast(background, text)

	// if the contrast is good enough, return the background
	if (contrast > contrastThreshold) {
		return background
	}

	// if the contrast is 1, then the colors are the same. we need to make a special case for this.
	// if the background is dark, lighten it. if the background is light, darken it.
	if (contrast === 1) {
		if (backgroundLuminance < 0.5) {
			const newColor = lighten(background, 0.1)
			return adjustContrast(newColor, text)
		} else {
			const newColor = darken(background, 0.1)
			return adjustContrast(newColor, text)
		}
	}

	// if the background is black or white, we can't adjust it any further
	if (
		getContrast(background, "black") === 1 ||
		getContrast(background, "white") === 1
	) {
		return background
	}

	// if the background is darker than the text, darken it.
	if (backgroundLuminance < textLuminance) {
		const newColor = darken(background, 0.1)
		return adjustContrast(newColor, text)
	}

	// if the background is lighter than the text, lighten it.
	if (backgroundLuminance > textLuminance) {
		const newColor = lighten(background, 0.1)
		return adjustContrast(newColor, text)
	}

	console.warn("Could not adjust contrast?")

	return background
}
