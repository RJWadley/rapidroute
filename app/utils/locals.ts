import { useLocalStorageState } from "ahooks"
import { useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { useClientOnly } from "./useClientOnly"

export const useLocalIsometric = () => {
	const [direct, setDirect] = useLocalStorageState("isometric", {
		defaultValue: "isometric",
		listenStorageChange: true,
	})

	const setPreference = (value: boolean) => {
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				flushSync(() => setDirect(value ? "isometric" : "flat"))
			})
		} else {
			setDirect(value ? "isometric" : "flat")
		}
	}

	return [direct === "isometric", setPreference] as const
}

function useSystemDarkMode() {
	return useSyncExternalStore(
		// Subscribe to changes in the dark mode preference
		(callback) => {
			const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
			mediaQueryList.addEventListener("change", callback)
			return () => mediaQueryList.removeEventListener("change", callback)
		},

		// Function to get the current dark mode status
		() => window.matchMedia("(prefers-color-scheme: dark)").matches,
		() => null,
	)
}

export const useLocalDark = () => {
	const systemIsDark = useSystemDarkMode()
	const [preferenceDirect, setPreferenceDirect] = useLocalStorageState("dark", {
		defaultValue: "system",
		listenStorageChange: true,
		serializer: (value) => value,
		deserializer: (value) => value,
	})

	const setPreference = (value: "system" | "light" | "dark") => {
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				setPreferenceDirect(value)
			})
		} else {
			setPreferenceDirect(value)
		}
	}

	const currentPreference =
		preferenceDirect === "light"
			? "light"
			: preferenceDirect === "dark"
				? "dark"
				: "system"
	const isDark =
		currentPreference === "system" ? systemIsDark : currentPreference === "dark"

	return [
		useClientOnly(
			{
				isDark: isDark || false,
				preference: currentPreference,
			} as const,
			{
				isDark: null,
				preference: null,
			} as const,
		),
		setPreference,
	] as const
}
