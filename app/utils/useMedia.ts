import { startTransition, useEffect, useState } from "react"

export default function useMedia(query: string): boolean {
  const [state, setState] = useState(false)

  useEffect(() => {
    // set state based on match
    const match = window.matchMedia(query).matches
    setState(match)

    // update state on change
    let mounted = true
    const mql = window.matchMedia(query)
    const onChange = () => {
      if (!mounted) {
        return
      }
      startTransition(() => {
        setState(!!mql.matches)
      })
    }
    mql.addEventListener("change", onChange)

    return () => {
      mounted = false
      mql.removeEventListener("change", onChange)
    }
  }, [query])

  return state
}
