import { useClientOnly } from "(temp)/utils/ClientOnly"
import TypedEventEmitter from "(temp)/utils/TypedEventEmitter"
import { useCallback, useEffect, useState } from "react"

const events = new TypedEventEmitter<{
	sync: []
}>()

export type LocalKeys = "darkMode"

export type StateTypes<K extends LocalKeys> = K extends "darkMode"
	? "light" | "dark" | "system"
	: never

/**
 * useState that syncs with localStorage
 * @param key the key to use in localStorage
 * @returns null if the value is not set, undefined during hydration, or the value
 */
export const useLocalState = <K extends LocalKeys>(key: K) => {
	type T = StateTypes<K>
	const [value, setValue] = useState<T | null>()

	// listen to changes on this tab
	useEffect(() => {
		const onSync = () => {
			const newValue = localStorage.getItem(key)
			setValue((previous) => {
				try {
					// deep compare to avoid unnecessary re-renders
					if (JSON.stringify(previous) === newValue) return previous
					return JSON.parse(newValue ?? "null") as T
				} catch (error) {
					return null
				}
			})
		}

		onSync()

		events.addEventListener("sync", onSync)
		window.addEventListener("storage", onSync)
		return () => {
			events.removeEventListener("sync", onSync)
			window.removeEventListener("storage", onSync)
		}
	}, [key])

	const externalSetValue = useCallback(
		(newValue: T | null) => {
			localStorage.setItem(key, JSON.stringify(newValue))
			events.dispatchEvent("sync")
		},
		[key],
	)

	return [useClientOnly(value), externalSetValue] as const
}
