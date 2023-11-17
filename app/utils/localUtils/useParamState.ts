import { useCallback, useEffect, useState } from "react"
import { useClientOnly } from "utils/ClientOnly"
import TypedEventEmitter from "utils/TypedEventEmitter"

const events = new TypedEventEmitter<{
  sync: []
}>()

export type ParamKeys = "from" | "to"

/**
 * useState that syncs with URL params
 * @param key the key to use in URL params
 * @returns null if the value is not set, undefined during hydration, or the value
 */
export const useParamState = <K extends ParamKeys>(key: K) => {
  const [value, setValue] = useState<string | null>()

  useEffect(() => {
    const onSync = () => {
      const params = new URLSearchParams(window.location.search)
      const newValue = params.get(key)
      setValue(newValue)
    }

    onSync()

    events.addEventListener("sync", onSync)
    return () => {
      events.removeEventListener("sync", onSync)
    }
  }, [key])

  const externalSetValue = useCallback(
    (newValue: string | null) => {
      const params = new URLSearchParams(window.location.search)
      if (newValue === null) {
        params.delete(key)
      } else {
        params.set(key, newValue)
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, "", newUrl)

      events.dispatchEvent("sync")
    },
    [key],
  )

  return [useClientOnly(value), externalSetValue] as const
}
