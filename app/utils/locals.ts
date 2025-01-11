import { useCookieState } from "ahooks"
import { useSyncExternalStore } from "react"
import TypedEventEmitter from "./TypedEventEmitter"
import { flushSync } from "react-dom"

const events = new TypedEventEmitter<{
	darkModeChange: [newValue: "system" | "light" | "dark"]
	isometricChange: [newValue: "isometric" | "flat"]
}>()

export const useLocalIsometric = () => {
	const [direct, setDirect] = useCookieState("isometric", {
		defaultValue: "isometric",
	})

	events.useEventListener("isometricChange", (newValue) => {
		setDirect(newValue)
	})

	return [
		direct === "isometric",
		(value: boolean) => {
			events.dispatchEvent("isometricChange", value ? "isometric" : "flat")
		},
	] as const
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
	const [preferenceDirect, setPreferenceDirect] = useCookieState("dark", {
		defaultValue: "system",
	})

	events.useEventListener("darkModeChange", (newValue) => {
		flushSync(() => {
			if (newValue !== preferenceDirect) setPreferenceDirect(newValue)
		})
	})

	const currentPreference =
		preferenceDirect === "light"
			? "light"
			: preferenceDirect === "dark"
				? "dark"
				: "system"

	const setPreference = (value: "system" | "light" | "dark") => {
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				events.dispatchEvent("darkModeChange", value)
			})
		} else {
			events.dispatchEvent("darkModeChange", value)
		}
	}

	const isDark =
		currentPreference === "system" ? systemIsDark : currentPreference === "dark"

	return [
		{
			isDark,
			preference: currentPreference,
		},
		setPreference,
	] as const
}
