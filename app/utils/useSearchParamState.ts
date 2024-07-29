import { useQuery } from "@tanstack/react-query"
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react"
import { isBrowser } from "./isBrowser"

// always the most up-to-date search params (browser only)
// on the server its important to refetch search params every call
const liveSearchParams = isBrowser
	? new URLSearchParams(window.location.search)
	: null
const updateFunctions: Record<
	string,
	Record<string, Dispatch<SetStateAction<string | null>>>
> = {}

let lastSavedURL: string | null = null
if (liveSearchParams) {
	setInterval(() => {
		// apply updates to the URL
		const url = new URL(window.location.href)
		url.search = liveSearchParams.toString()
		const newURL = url.toString()
		if (newURL !== lastSavedURL) {
			window.history.replaceState({}, "", newURL)
			lastSavedURL = newURL
		}
	}, 500)
}

export function useSearchParamState(name: string) {
	const serverParams = useQuery<{
		[key: string]: string | string[] | undefined
	}>({
		queryKey: ["search-params"],
	})

	const getInitialValue = (key: string) => {
		if (liveSearchParams) {
			return liveSearchParams?.get(key)
		}

		const value = serverParams.data?.[key]
		if (Array.isArray(value)) return value[0]
		return value
	}

	const [value, setValue] = useState(() => getInitialValue(name) || null)

	useEffect(() => {
		const randomId = crypto.randomUUID()
		updateFunctions[name] ||= {}
		updateFunctions[name][randomId] = setValue

		return () => {
			updateFunctions[name] ||= {}
			delete updateFunctions[name][randomId]
		}
	}, [name])

	const update = useCallback(
		(newValue: string | null | undefined) => {
			// save the param to the URL
			if (newValue) liveSearchParams?.set(name, newValue)
			else liveSearchParams?.delete(name)

			const updatersForName = Object.values(updateFunctions[name] ?? {})
			for (const updater of updatersForName) {
				updater(newValue || null)
			}
		},
		[name],
	)

	return [value || null, update] as const
}

/**
 * set the value of a search param, without triggering a re-render
 */
export const setParamManually = (name: string, value: string | null) => {
	if (value) liveSearchParams?.set(name, value)
	else liveSearchParams?.delete(name)

	const updatersForName = Object.values(updateFunctions[name] ?? {})
	for (const updater of updatersForName) {
		updater(value || null)
	}
}
