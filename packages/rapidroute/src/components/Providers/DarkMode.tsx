import { createContext, ReactNode, useEffect, useState } from "react"

import { getLocal, setLocal } from "utils/localUtils"
import useMedia from "utils/useMedia"

export const darkModeContext = createContext<boolean | undefined>(undefined)

type Preference = "dark" | "light" | "system"
const isPreference = (value?: string | null): value is Preference =>
  ["dark", "light", "system"].includes(value || "")

let setSignal: React.Dispatch<React.SetStateAction<boolean>> | undefined

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<Preference | undefined>()
  const [isDark, setIsDark] = useState<boolean | undefined>()
  const systemIsDark = useMedia("(prefers-color-scheme: dark)")
  const [refreshSignal, setRefreshSignal] = useState(false)
  setSignal = setRefreshSignal

  useEffect(() => {
    const savedPreference = getLocal("darkMode")
    if (isPreference(savedPreference)) {
      setPreference(savedPreference)
    } else setPreference("system")
  }, [refreshSignal])

  useEffect(() => {
    if (preference) {
      setLocal("darkMode", preference)
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

export const triggerRecalculation = () => setSignal?.(prev => !prev)
