import { useCallback, useState } from "react"
import TypedEventEmitter from "./TypedEventEmitter"
import { getSearchParams } from "./getSearchParams"

const updater = new TypedEventEmitter<{
	update: [string, string | null]
}>()

// always the most up-to-date search params
const liveSearchParams = getSearchParams()

if (typeof window !== "undefined") {
	setInterval(() => {
		// apply updates to the URL
		const url = new URL(window.location.href)
		url.search = liveSearchParams.toString()
		window.history.replaceState(null, "", url.toString())
	}, 500)
}

export function useSearchParamState(name: string) {
	const initialParams = getSearchParams()
	const [value, setValue] = useState(initialParams?.get(name) || null)

	updater.useEventListener("update", (updateName, value) => {
		if (updateName === name) setValue(value || null)
	})

	const update = useCallback(
		(newValue: string | null | undefined) => {
			updater.dispatchEvent("update", name, newValue || null)

			// save the param to the URL
			if (newValue) liveSearchParams?.set(name, newValue)
			else liveSearchParams?.delete(name)
		},
		[name],
	)

	return [value || null, update] as const
}
