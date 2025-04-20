import { Assets, type Texture } from "pixi.js"
import { useEffect, useState } from "react"

export function useAsset(url: string) {
	const [result, setResult] = useState<Texture | null>()

	useEffect(() => {
		Assets.load(url)
			.then((texture) => {
				setResult(texture)
			})
			.catch(() => {
				setResult(null)
			})
	})

	return result
}
