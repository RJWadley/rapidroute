import type { RouteType } from "@prisma/client"
import { useAsyncEffect } from "ahooks"
import { useState } from "react"

import { findPath } from "./findPath"

export const usePath = (
  from: { id: string } | null | undefined,
  to: { id: string } | null | undefined,
  allowedModes: RouteType[]
) => {
  const [results, setResults] = useState<Awaited<ReturnType<typeof findPath>>>()
  const [isRouting, setIsRouting] = useState(false)
  const [needsUpdate, setNeedsUpdate] = useState(false)

  useAsyncEffect(async () => {
    if (!from || !to) return
    if (from.id === to.id) return
    if (isRouting) return setNeedsUpdate(true)

    console.log("usePath", from, to, isRouting)
    setIsRouting(true)
    setResults(undefined)

    console.log("fetching path")
    const result = await findPath(from.id, to.id, allowedModes)
    console.log("found path from", from.id, "to", to.id)

    console.log("fetched path")
    setResults(result)
    setIsRouting(false)
    setNeedsUpdate(false)
  }, [from, to, needsUpdate])

  return { results, isRouting }
}
