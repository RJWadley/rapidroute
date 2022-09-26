import React, { createContext, ReactNode, useEffect, useState } from "react"

export const darkModeContext = createContext(false)

export const setToMatchUserPreference = (
  setDarkMode: (darkMode: boolean) => void
) => {
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
  setDarkMode(prefersDarkMode.matches)
}

// dark mode provider that syncs with local storage, and defaults to match the user's system preference
export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
    const darkModePreference = localStorage.getItem("darkMode")

    if (darkModePreference === "true") {
      setDarkMode(true)
    } else if (darkModePreference === "false") {
      setDarkMode(false)
    } else {
      setToMatchUserPreference(setDarkMode)
    }

    prefersDarkMode.addEventListener("change", () => {
      setToMatchUserPreference(setDarkMode)
    })
  }, [])

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])

  return (
    <darkModeContext.Provider value={darkMode}>
      {children}
    </darkModeContext.Provider>
  )
}
