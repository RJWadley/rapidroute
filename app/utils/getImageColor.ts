import { FastAverageColor } from "fast-average-color"

const fac = new FastAverageColor()

export const getImageColor = async (url: string) => {
	return (await fac.getColorAsync(url)).hex
}
