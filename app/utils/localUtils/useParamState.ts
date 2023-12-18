import { useCallback, useEffect, useState } from "react"
import { isBrowser } from "utils/isBrowser"
import TypedEventEmitter from "utils/TypedEventEmitter"

/**
 * all the valid keys that could go into the URL
 */
export type ParamKeys = "from" | "to"

const events = new TypedEventEmitter<{
  sync: [key: string, newValue: string | null]
}>()

const currentParams = new URLSearchParams(
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  isBrowser ? window.location.search : "",
)

/**
 * sync the URL params with the current state once per second
 */
setInterval(() => {
  const newParams = new URLSearchParams(currentParams.toString())
  if (isBrowser) window.history.replaceState({}, "", `?${newParams.toString()}`)
}, 1000)

/**
 * useState that syncs with URL params
 * @param key the key to use in URL params
 * @returns null if the value is not set, undefined during hydration, or the value
 */
export const useParamState = <K extends ParamKeys>(key: K) => {
  const [value, setValue] = useState<string | null>()

  // listen to changes on this tab
  useEffect(() => {
    // sync the state from the URL on mount
    const initialValue = currentParams.get(key)
    setValue(initialValue)

    const onSync = (syncKey: string, newValue: string | null) => {
      if (syncKey === key) setValue(newValue)
    }

    // listen for changes on other instances of this hook
    events.addEventListener("sync", onSync)
    return () => {
      events.removeEventListener("sync", onSync)
    }
  }, [key])

  const externalSetValue = useCallback(
    (newValue: string | null) => {
      // Set or update the specified key with the provided value
      if (newValue === null) currentParams.delete(key)
      else currentParams.set(key, newValue)

      events.dispatchEvent("sync", key, newValue)
    },
    [key],
  )

  return [value, externalSetValue] as const
}
