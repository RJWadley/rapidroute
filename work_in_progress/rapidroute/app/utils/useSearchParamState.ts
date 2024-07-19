import { useCallback, useState } from "react"
import TypedEventEmitter from "./TypedEventEmitter"

const { headers } =
	typeof window === "undefined" ? require("next/headers") : { headers: null }

const getSearchParams = () => {
	// if we're on the server, parse the URL from the headers (see middleware.ts)
	if (headers) {
		// get the full URL
		const headersList = headers()
		const fullUrl = headersList.get("x-next-url")
		if (!fullUrl) throw new Error("Cannot find x-next-url header")
		const url = new URL(fullUrl)

		// get the search params

		return new URLSearchParams(url.search)
	}

	return new URLSearchParams(window.location.search)
}

const updater = new TypedEventEmitter<{
	update: [string, string]
}>()

// always the most up-to-date search params
const liveSearchParams = getSearchParams()

if (typeof window !== "undefined") {
	setInterval(() => {
		// apply updates to the URL
		const url = new URL(window.location.href)
		url.search = liveSearchParams.toString()
		window.history.replaceState(null, "", url.toString())
	}, 100)
}

export function useSearchParamState(name: string) {
	const initialParams = getSearchParams()
	const [value, setValue] = useState(initialParams?.get(name) || null)

	updater.useEventListener("update", (updateName, value) => {
		if (updateName === name) setValue(value)
	})

	const update = useCallback(
		(newValue: string) => {
			updater.dispatchEvent("update", name, newValue)

			// save the param to the URL
			if (newValue) liveSearchParams?.set(name, newValue)
			else liveSearchParams?.delete(name)
		},
		[name],
	)

	return [value || null, update] as const
}
