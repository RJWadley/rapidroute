"use client"

import type { ReactNode } from "react"
import { createContext, useLayoutEffect } from "react"
import { useLocalState } from "(temp)/utils/localUtils/useLocalState"
import useMedia from "(temp)/utils/useMedia"

export const darkModeContext = createContext<boolean | undefined>(undefined)
export const setDarkModeContext = createContext<
  ((value: "dark" | "light" | "system") => void) | undefined
>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  /**
   * the saved preference in settings
   */
  const [preference, setPreference] = useLocalState("darkMode")
  /**
   * the OS preference
   */
  const systemIsDark = useMedia("(prefers-color-scheme: dark)")

  const isDark =
    preference === "system" || !preference ? systemIsDark : Boolean(preference)

  /**
   * smoothly transition between dark and light mode
   */
  useLayoutEffect(() => {
    document.documentElement.classList.add("in-transition")
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("in-transition")
    }, 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [isDark])

  return (
    <darkModeContext.Provider value={isDark}>
      <setDarkModeContext.Provider value={setPreference}>
        {children}
      </setDarkModeContext.Provider>
    </darkModeContext.Provider>
  )
}
