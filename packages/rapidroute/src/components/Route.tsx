import React, { useEffect, useMemo, useRef, useState } from "react"

import gsap from "gsap"
import styled, { css } from "styled-components"

import { getPath } from "data/getData"
import { ResultType } from "pathfinding/findPath"
import describeDiff from "pathfinding/postProcessing/describeDiff"
import media from "utils/media"

import createSegments, { SegmentType } from "./createSegments"
import RoundButton from "./RoundButton"
import Segment from "./Segment"
import Spinner from "./Spinner"

interface RouteProps {
  route: ResultType
  diff: string[]
  expandByDefault: boolean
}

export default function Route({ route, diff, expandByDefault }: RouteProps) {
  const [segments, setSegments] = useState<SegmentType[] | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(expandByDefault)
  const dropdownContent = useRef<HTMLDivElement>(null)

  /**
   * Create segments from route data
   */
  useMemo(async () => {
    if (!dropdownOpen) return

    const promises = route.path.map(async locationId => {
      return getPath("locations", locationId)
    })

    Promise.all(promises).then(locations => {
      // for each set of locations, get the routes they have in common
      const routePromises = locations.map((location, index) => {
        if (index === 0) {
          return []
        }
        const previousLocation = locations[index - 1]
        if (!previousLocation || !location) {
          return [Promise.resolve(null)]
        }

        const commonRoutes = (location.routes || []).filter(routeId =>
          (previousLocation.routes || []).includes(routeId)
        )

        return commonRoutes.map(async routeId => {
          return getPath("routes", routeId)
        })
      })

      // wait for all promises to resolve
      Promise.all(routePromises.map(p => Promise.all(p))).then(routes => {
        routes.shift()
        setSegments(createSegments(locations, routes))
      })
    })
  }, [dropdownOpen, route.path])

  /**
   * animate opening and closing of dropdown
   */
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
  }, [dropdownOpen, segments])

  return (
    <Wrapper>
      <Via>
        <div>Via {describeDiff(diff)}</div>
        <RoundButton
          onClick={() => setDropdownOpen(!dropdownOpen)}
          flipped={dropdownOpen}
        >
          expand_more
        </RoundButton>
      </Via>
      <CustomSpinner show={dropdownOpen && !segments} />
      <Dropdown ref={dropdownContent}>
        {segments?.map(segment => (
          <Segment key={segment.from.uniqueId} segment={segment} />
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
