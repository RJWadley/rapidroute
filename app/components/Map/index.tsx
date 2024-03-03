"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const MapBase = dynamic(() => import("./MapBase").then((mod) => mod.default), {
  ssr: false,
})

export default function Map() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  return <div>{isMounted && <MapBase />}</div>
}
