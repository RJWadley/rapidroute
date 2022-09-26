import React, { createContext, ReactNode, useEffect, useState } from "react"

import useMedia from "utils/useMedia"

export const darkModeContext = createContext<boolean | undefined>(undefined)

type Preference = "dark" | "light" | "system"
const isPreference = (value?: string | null): value is Preference =>
  ["dark", "light", "system"].includes(value || "")

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference | undefined>()
  const [isDark, setIsDark] = useState<boolean | undefined>()
  const systemIsDark = useMedia("(prefers-color-scheme: dark)")

  useEffect(() => {
    const savedPreference = localStorage.getItem("darkMode")
    if (isPreference(savedPreference)) {
      setPreference(savedPreference)
    } else setPreference("system")
  }, [])

  useEffect(() => {
    if (preference) {
      localStorage.setItem("darkMode", preference)
      if (preference === "system") setIsDark(systemIsDark)
      else setIsDark(preference === "dark")
    }
  }, [preference, systemIsDark])

  return (
    <darkModeContext.Provider value={isDark}>
      {children}
    </darkModeContext.Provider>
  )
}
