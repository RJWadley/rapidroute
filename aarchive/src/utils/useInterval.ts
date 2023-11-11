import { useEffect, useRef } from "react"

type Callback = VoidFunction | (() => VoidFunction)

const useInterval = (callback: Callback, delay?: number | null) => {
  const savedCallback = useRef<Callback>()

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    if (delay !== null) {
      let cleanup: VoidFunction | undefined

      const interval = setInterval(() => {
        if (cleanup) cleanup()
        const nextCleanup = savedCallback.current?.()
        if (nextCleanup) cleanup = nextCleanup
      }, delay ?? 0)

      return () => {
        if (cleanup) cleanup()
        clearInterval(interval)
      }
    }
  }, [delay])
}

export default useInterval
