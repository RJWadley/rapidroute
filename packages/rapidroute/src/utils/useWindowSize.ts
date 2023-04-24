import { useEffect, useState } from "react"

import { isBrowser } from "./functions"

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState(getSize())

  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize())
    }

    handleResize()
    if (isBrowser()) {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return windowSize
}

const getSize = () => ({
  width: isBrowser() ? window.innerWidth : 0,
  height: isBrowser() ? window.innerHeight : 0,
})
