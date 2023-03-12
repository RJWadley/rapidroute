import { useContext, useEffect, useRef, useState } from "react"

import { RouteMode, shortHandMap } from "@rapidroute/database-types"
import gsap from "gsap"
import styled, { css } from "styled-components"

import { RoutingContext } from "components/Providers/RoutingContext"

export default function AllowedModes() {
  const { allowedModes, setAllowedModes } = useContext(RoutingContext)
  const [showFilters, setShowFilters] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  const toggleMode = (mode: RouteMode) => {
    if (allowedModes.includes(mode)) {
      setAllowedModes(allowedModes.filter(m => m !== mode))
    } else {
      setAllowedModes([...allowedModes, mode])
    }
  }

  /**
   * animate in and out the filters
   */
  useEffect(() => {
    const t1 = gsap.to(filtersRef.current, {
      height: showFilters ? "auto" : 0,
      duration: 1,
      ease: showFilters ? "power3.out" : "power3.in",
    })

    if (filtersRef.current?.children) {
      const t2 = gsap.to(filtersRef.current.children, {
        opacity: showFilters ? 1 : 0,
        y: showFilters ? 0 : 20,
        pointerEvents: showFilters ? "all" : "none",
        stagger: showFilters ? 0.1 : -0.1,
        ease: showFilters ? "power2.out" : "power2.in",
      })

      return () => {
        t1.kill()
        t2.kill()
      }
    }
    return () => {
      t1.kill()
    }
  }, [showFilters])

  return (
    <Wrapper>
      <FilterButton onClick={() => setShowFilters(!showFilters)}>
        Filter Search
      </FilterButton>
      <Filters ref={filtersRef}>
        {Object.values(shortHandMap).map(mode => (
          <Selection
            active={allowedModes.includes(mode)}
            key={mode}
            onClick={() => toggleMode(mode)}
          >
            {getModeDisplayName(mode)}
          </Selection>
        ))}
      </Filters>
    </Wrapper>
  )
}

const getModeDisplayName = (mode: RouteMode) => {
  switch (mode) {
    case "MRT":
      return "MRT"
    case "flight":
      return "Flight"
    case "heli":
      return "Helicopter"
    case "seaplane":
      return "Seaplane"
    case "spawnWarp":
      return "Warps"
    case "walk":
      return "Walk"
    default:
      return "Missing Name"
  }
}

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`

const FilterButton = styled.button`
  margin: 10px 30px;
  font-size: var(--extra-small);
  font-weight: 300;
  color: var(--low-contrast-text);
  cursor: pointer;
`

const Filters = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`

const Selection = styled.div<{ active: boolean }>`
  background-color: var(--default-card-background);
  padding: 20px 30px 20px 60px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, font-weight 0.2s ease-in-out,
    letter-spacing 0.2s ease-in-out;
  letter-spacing: 0.025em;
  position: relative;
  white-space: nowrap;
  opacity: 0;

  //check
  :before {
    content: "";
    position: absolute;
    top: calc(50% - 10px);
    left: 35px;
    width: 2px;
    height: 20px;
    background-color: var(--default-text);
    rotate: 45deg;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;
  }
  :after {
    content: "";
    position: absolute;
    top: calc(50% - 10px);
    left: 35px;
    width: 2px;
    height: 20px;
    background-color: var(--default-text);
    rotate: -45deg;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;
  }

  // active
  ${({ active }) =>
    active &&
    css`
      background-color: var(--background-green);
      font-weight: bold;
      letter-spacing: 0;

      :before {
        top: calc(50% - 2px);
        left: 30px;
        height: 10px;
        rotate: 135deg;
      }
      :after {
        left: 40px;
        rotate: 45deg;
      }
    `}
`
