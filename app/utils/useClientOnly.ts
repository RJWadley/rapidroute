import { startTransition, useLayoutEffect, useState } from "react"

export const useClientOnly = <T, F>(value: T, fallback: F) => {
	const [isClient, setIsClient] = useState(false)

	useLayoutEffect(() => {
		startTransition(() => {
			setIsClient(true)
		})
	}, [])

	return isClient ? value : fallback
}
