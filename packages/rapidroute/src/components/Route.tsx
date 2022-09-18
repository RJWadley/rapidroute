/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from "react"

import { Location, Route as RouteType } from "@rapidroute/database-types"

import { getPath } from "data/getData"
import describeDiff from "pathfinding/postProcessing/describeDiff"

import styled from "styled-components"
import createSegments, { SegmentType } from "./createSegments"
import Segment from "./Segment"

interface RouteProps {
  route: string[]
  diff: string[]
}

export default function Route({ route, diff }: RouteProps) {
  const [locations, setLocations] = useState<(Location | null)[] | null>(null)
  const [routes, setRoutes] = useState<(RouteType | null)[][] | null>(null)
  const [segments, setSegments] = useState<SegmentType[] | null>(null)

  useMemo(() => {
    setRoutes(null)
    setLocations(null)
    setSegments(null)

    const promises = route.map(locationId => getPath("locations", locationId))

    Promise.all(promises).then(results => {
      setLocations(results)

      // for each set of locations, get the routes they have in common
      const routePromises = results.map((location, index) => {
        if (index === 0) {
          return []
        }
        const previousLocation = results[index - 1]
        if (!previousLocation || !location) {
          return [Promise.resolve(null)]
        }

        const commonRoutes = (location.routes || []).filter(routeId =>
          (previousLocation.routes || []).includes(routeId)
        )

        return commonRoutes.map(routeId => getPath("routes", routeId))
      })

      // wait for all promises to resolve
      Promise.all(routePromises.map(p => Promise.all(p))).then(objs => {
        objs.shift()

        setRoutes(objs)
      })
    })
  }, [route])

  useMemo(() => {
    if (routes && locations) {
      setSegments(createSegments(locations, routes))
    }
  }, [routes, locations])

  return (
    <Wrapper>
      <div>Via {describeDiff(diff)}</div>
      {segments?.map((segment, index) => (
        <Segment key={segment.from.uniqueId} segment={segment} />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
`
