import { useState, useEffect, useCallback } from "react"

import { isBrowser } from "./functions"

export default function useInnerVh(vh: number) {
  const [currentHeight, setCurrentHeight] = useState("100vh")

  const updateSize = useCallback(() => {
    if (isBrowser()) {
      if (window.innerHeight === 0) setCurrentHeight(`${vh}vh`)
      else setCurrentHeight(`${window.innerHeight * (vh / 100)}px`)
    }
  }, [vh])

  useEffect(() => {
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => {
      window.removeEventListener("resize", updateSize)
    }
  }, [updateSize])

  return currentHeight
}
