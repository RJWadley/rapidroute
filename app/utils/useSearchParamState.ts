import { useSafeState } from "ahooks"
import { useCallback, useEffect } from "react"
import { getSearchParams } from "./getSearchParams"
import { isBrowser } from "./isBrowser"

// always the most up-to-date search params (browser only)
// on the server its important to refetch search params every call
const liveSearchParams = isBrowser ? getSearchParams() : null
const updaters: Record<string, ((value: string | null) => void)[]> = {}

if (liveSearchParams) {
	setInterval(() => {
		// apply updates to the URL
		const url = new URL(window.location.href)
		url.search = liveSearchParams.toString()
		window.history.replaceState(null, "", url.toString())
	}, 500)
}

export function useSearchParamState(name: string) {
	const [value, setValue] = useSafeState(
		liveSearchParams?.get(name) || getSearchParams().get(name) || null,
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
