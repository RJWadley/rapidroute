import { useQuery } from "@tanstack/react-query"
import { FastAverageColor } from "fast-average-color"

const fac = new FastAverageColor()

const getImageColor = async (url: string) => {
	return (await fac.getColorAsync(url)).hex
}

export const useImageColor = (url: string) => {
	return useQuery({
		queryKey: ["image-color", url],
		queryFn: () => getImageColor(url),
	})
}
