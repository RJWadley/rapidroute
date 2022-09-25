/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react"

import { Location, Route as RouteType } from "@rapidroute/database-types"

import { getPath } from "data/getData"
import describeDiff from "pathfinding/postProcessing/describeDiff"

import styled, { css } from "styled-components"
import gsap from "gsap"
import media from "utils/media"
import { sleep } from "utils/functions"
import { ResultType } from "pathfinding/findPath"
import createSegments, { SegmentType } from "./createSegments"
import Segment from "./Segment"
import RoundButton from "./RoundButton"
import Spinner from "./Spinner"

interface RouteProps {
  route: ResultType
  diff: string[]
  expandByDefault: boolean
  loadDelay: number
}

export default function Route({
  route,
  diff,
  expandByDefault,
  loadDelay,
}: RouteProps) {
  const [locations, setLocations] = useState<(Location | null)[] | null>(null)
  const [routes, setRoutes] = useState<(RouteType | null)[][] | null>(null)
  const [segments, setSegments] = useState<SegmentType[] | null>(null)

  useMemo(async () => {
    setRoutes(null)
    setLocations(null)
    setSegments(null)

    const promises = route.path.map(async locationId => {
      await sleep(loadDelay * 1000 + Math.random() * 500)
      return getPath("locations", locationId)
    })

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

        return commonRoutes.map(async routeId => {
          await sleep(loadDelay * 1000)
          return getPath("routes", routeId)
        })
      })

      // wait for all promises to resolve
      Promise.all(routePromises.map(p => Promise.all(p))).then(objs => {
        objs.shift()

        setRoutes(objs)
      })
    })
  }, [loadDelay, route])

  useMemo(() => {
    if (routes && locations) {
      setSegments(createSegments(locations, routes))
    }
  }, [routes, locations])

  const [dropdownOpen, setDropdownOpen] = useState(expandByDefault)
  const dropdownContent = useRef<HTMLDivElement>(null)

  const clickHandler = () => {
    setDropdownOpen(!dropdownOpen)
  }

  useEffect(() => {
    const t1 = gsap.to(dropdownContent.current, {
      height: dropdownOpen ? "auto" : 0,
      delay: dropdownOpen ? 0 : 0.5,
    })

    if (dropdownContent.current?.children.length) {
      const t2 = gsap.to(dropdownContent.current.children, {
        y: dropdownOpen ? 0 : 200,
        stagger: dropdownOpen ? 0.1 : -0.05,
        opacity: dropdownOpen ? 1 : 0,
        ease: dropdownOpen ? "power3.out" : "power3.in",
      })
      return () => {
        t1.kill()
        t2.kill()
      }
    }
    return () => {
      t1.kill()
    }
  }, [dropdownOpen])

  return (
    <Wrapper>
      <Via>
        <div>Via {describeDiff(diff)}</div>
        <RoundButton onClick={clickHandler} flipped={dropdownOpen}>
          expand_more
        </RoundButton>
      </Via>
      <CustomSpinner show={dropdownOpen && !!locations && !segments} />
      <Dropdown ref={dropdownContent}>
        {segments?.map((segment, i) => (
          <Segment
            key={segment.from.uniqueId}
            segment={segment}
            isOpen={dropdownOpen}
            position={i}
          />
        ))}
      </Dropdown>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  gap: 15px;
  opacity: 0;
  margin-top: 30px;
`

const Via = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 30px;
  font-size: 40px;
  @media ${media.mobile} {
    font-size: 20px;
  }
`

const CustomSpinner = styled(Spinner)<{ show: boolean }>`
  ${({ show }) =>
    !show &&
    css`
      height: 0;
      margin: 0;
    `}
  transition: height 0.5s ease-in-out, margin 0.5s ease-in-out;
`

const Dropdown = styled.div`
  overflow: hidden;
  display: grid;
  gap: 20px;
  height: 0;
`
