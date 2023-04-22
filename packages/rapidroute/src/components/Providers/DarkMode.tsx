import {
  createContext,
  ReactNode,
  startTransition,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"
import { createGlobalStyle, css } from "styled-components"
import { getLocal, setLocal } from "utils/localUtils"
import useMedia from "utils/useMedia"

export const darkModeContext = createContext<boolean | undefined>(undefined)
export const setDarkModeContext = createContext<
  ((value: "dark" | "light" | "system") => void) | undefined
>(undefined)

type Preference = "dark" | "light" | "system"
const isPreference = (value?: string | null): value is Preference =>
  ["dark", "light", "system"].includes(value || "")

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference | undefined>()
  const [isDark, setIsDark] = useState<boolean>()
  const systemIsDark = useMedia("(prefers-color-scheme: dark)")

  /**
   * pull the initial state from local storage
   */
  useEffect(() => {
    const savedPreference = getLocal("darkMode")
    if (isPreference(savedPreference)) {
      setPreference(savedPreference)
    } else setPreference("system")
  }, [])

  /**
   * update the local storage when the preference changes
   */
  useEffect(() => {
    if (preference) {
      setLocal("darkMode", preference)
      startTransition(() => {
        if (preference === "system") setIsDark(systemIsDark)
        else setIsDark(preference === "dark")
      })
    }
  }, [preference, systemIsDark])

  useLayoutEffect(() => {
    if (isDark === undefined) return
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
        <TransitionStyle />
      </setDarkModeContext.Provider>
    </darkModeContext.Provider>
  )
}

const TransitionStyle = createGlobalStyle`${css`
  .in-transition {
    &,
    * {
      transition: background-color 0.5s ease, color 0.1s ease !important;
    }
  }
`}`
