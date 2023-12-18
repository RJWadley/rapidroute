"use client"

import { RoutingContext } from "components/Providers/RoutingContext"
import { allRouteTypes } from "database/helpers"
import { usePath } from "pathfinding/usePath"
import { useContext } from "react"

export default function Results() {
  const { from, to } = useContext(RoutingContext)

  const path = usePath(from, to, [...allRouteTypes])

  return <div>Results: {JSON.stringify(path)} </div>
}
