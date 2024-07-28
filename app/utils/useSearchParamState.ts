import { useSafeState } from "ahooks"
import { useCallback, useEffect } from "react"
import { isBrowser } from "./isBrowser"
import { useQuery } from "@tanstack/react-query"

// always the most up-to-date search params (browser only)
// on the server its important to refetch search params every call
const liveSearchParams = isBrowser
	? new URLSearchParams(window.location.search)
	: null
const updaters: Record<string, ((value: string | null) => void)[]> = {}

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

	const getValueFromServer = (key: string) => {
		const value = serverParams.data?.[key]
		if (Array.isArray(value)) return value[0]
		return value
	}

	const [value, setValue] = useSafeState(
		liveSearchParams?.get(name) || getValueFromServer(name) || null,
	)

	useEffect(() => {
		updaters[name] ||= []
		updaters[name].push(setValue)

		return () => {
			updaters[name] =
				updaters[name]?.filter((updater) => updater !== setValue) ?? []
		}
	}, [name, setValue])

	const update = useCallback(
		(newValue: string | null | undefined) => {
			// save the param to the URL
			if (newValue) liveSearchParams?.set(name, newValue)
			else liveSearchParams?.delete(name)

			const updatersForName = updaters[name] ?? []
			for (const updater of updatersForName) {
				updater(newValue || null)
			}
		},
		[name],
	)

	return [value || null, update] as const
}
