import { useCookieState } from "ahooks"
import { useSyncExternalStore } from "react"

// TODO --- QUERY STATE ---

// --- COOKIE STATE ---
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
	const [preferenceDirect, setPreferenceDirect] = useCookieState("dark", {
		defaultValue: "system",
	})

	const currentPreference =
		preferenceDirect === "light"
			? "light"
			: preferenceDirect === "dark"
				? "dark"
				: "system"

	const setPreference = (value: "system" | "light" | "dark") => {
		setPreferenceDirect(value)
	}

	const systemIsDark = useSystemDarkMode()

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
