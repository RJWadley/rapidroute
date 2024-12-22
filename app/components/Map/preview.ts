import getTileUrl from "app/components/Map/Satellite/getTileURL"
import { createCanvas, loadImage } from "canvas"

export const getMapPreview = async () => {
	const canvas = createCanvas(256, 256)
	const ctx = canvas.getContext("2d")

	const tile = getTileUrl({ xIn: 0, zIn: 0, zoom: 0 })
	const tile2 = getTileUrl({ xIn: 1, zIn: 0, zoom: 0 })

	const image = await loadImage(tile)
	const image2 = await loadImage(tile2)
	ctx.drawImage(image, 0, 0, 128, 128)
	ctx.drawImage(image2, 128, 0, 128, 128)

	const promises: Promise<unknown>[] = []

	for (let row = -1; row <= 0; row += 1) {
		for (let column = -1; column <= 0; column += 1) {
			const tile = getTileUrl({ xIn: column, zIn: row, zoom: 0 })
			promises.push(
				loadImage(tile).then((image) => {
					ctx.drawImage(image, (column + 1) * 128, (row + 1) * 128, 128, 128)
				}),
			)
		}
	}

	await Promise.allSettled(promises)

	return canvas.toDataURL("image/jpeg", 90)
}
