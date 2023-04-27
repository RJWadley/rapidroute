import { useQuery } from "@tanstack/react-query"
import { getPath } from "data/getData"
import gsap from "gsap"
import { ResultType } from "pathfinding/findPath"
import describeDiff from "pathfinding/postProcessing/describeDiff"
import { useEffect, useRef, useState } from "react"
import styled, { css } from "styled-components"

import RoundButton from "./RoundButton"
import Segment from "./Segment"
import BeginNavigation from "./Segment/BeginNavigation"
import createSegments from "./Segment/createSegments"
import WillArrive from "./Segment/WillArrive"
import Spinner from "./Spinner"

interface RouteProps {
  route: ResultType
  diff?: string[]
  expandByDefault: boolean
}

export default function Route({ route, diff, expandByDefault }: RouteProps) {
  const [dropdownOpen, setDropdownOpen] = useState(expandByDefault)
  const dropdownContent = useRef<HTMLDivElement>(null)

  /**
   * Create segments from route data
   */
  const { data: segments } = useQuery({
    queryKey: ["segments", ...route.path],
    queryFn: async () => await resultToSegments(route),
  })

  /**
   * animate opening and closing of dropdown
   */
  useEffect(() => {
    const duration = 0.5
    const t1 = gsap.to(dropdownContent.current, {
      height: dropdownOpen ? "auto" : 0,
      delay: dropdownOpen ? 0 : duration,
      duration,
    })

    if (dropdownContent.current?.children.length) {
      const t2 = gsap.to(dropdownContent.current.children, {
        y: dropdownOpen ? 0 : 200,
        stagger: dropdownOpen ? duration / 5 : -duration / 10,
        opacity: dropdownOpen ? 1 : 0,
        ease: dropdownOpen ? "power3.out" : "power3.in",
        duration,
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

  const destination = segments?.[segments.length - 1]?.to

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
        {segments && (
          <>
            <BeginNavigation route={route.path} segments={segments} />
            {segments.map(segment => (
              <Segment key={segment.from.uniqueId} segment={segment} />
            ))}
            {destination && <WillArrive destination={destination} />}
          </>
        )}
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
  gap: 20px;
  padding: 10px 30px;
  font-size: var(--large);
`

const CustomSpinner = styled(Spinner)<{ show: boolean }>`
  ${({ show }) =>
    !show &&
    css`
      height: 0;
      margin: 0;
    `}
  transition: height 0.1s ease-in-out, margin 0.1s ease-in-out;
`

const Dropdown = styled.div`
  overflow: hidden;
  display: grid;
  gap: 20px;
  height: 0;
`

// rewritten with async/await
export const resultToSegments = async (result: ResultType) => {
  const promises = result.path.map(async locationId => {
    return getPath("places", locationId)
  })

  const locations = await Promise.all(promises)

  // for each set of locations, get the routes they have in common
  const routePromises = locations.map((location, index) => {
    if (index === 0) {
      return []
    }
    const previousLocation = locations[index - 1]
    if (!previousLocation || !location) {
      return [Promise.resolve(null)]
    }

    const commonRoutes = (location.routes ?? []).filter(routeId =>
      (previousLocation.routes ?? []).includes(routeId)
    )

    return commonRoutes.map(async routeId => {
      return getPath("routes", routeId)
    })
  })

  // wait for all promises to resolve
  const routes = await Promise.all(routePromises.map(p => Promise.all(p)))
  routes.shift()
  return createSegments(locations, routes)
}
