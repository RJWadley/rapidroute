import { JSDOM } from "jsdom"
import probe from "probe-image-size"
import "server-only"

export async function updateImageDimensions(
	htmlString: string,
): Promise<string> {
	const dom = new JSDOM(htmlString)
	const document = dom.window.document

	const imgTags = Array.from(document.querySelectorAll("img"))

	const updatePromises = imgTags.map(async (img) => {
		const src = img.getAttribute("src")
		if (!src) return // Skip images without a src attribute

		try {
			const { width, height } = await loadImageDimensions(src)
			img.setAttribute("width", width.toString())
			img.setAttribute("height", height.toString())
		} catch (error) {
			console.warn(`Failed to load image: ${src}`, error)
		}
	})

	await Promise.all(updatePromises)

	return dom.serialize()
}

export async function loadImageDimensions(
	src: string,
): Promise<{ width: number; height: number; src: string }> {
	const { width, height } = await probe(src)

	return { width, height, src }
}
