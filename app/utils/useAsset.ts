import { Assets, type SCALE_MODE, type Texture } from "pixi.js"
import { useEffect, useState } from "react"

export function useAsset(
	url: string,
	options?: { scaleMode?: SCALE_MODE },
) {
	const [result, setResult] = useState<Texture | null>()

	useEffect(() => {
		Assets.load(url)
			.then((texture: Texture) => {
				if (options?.scaleMode) texture.source.scaleMode = options.scaleMode
				setResult(texture)
			})
			.catch(() => {
				setResult(null)
			})
	})

	return result
}
