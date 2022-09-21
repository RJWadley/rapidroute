import { RouteMode, shortHandMap } from "@rapidroute/database-types"
import { RoutingContext } from "components/Providers/RoutingContext"
import React, { useContext, useState } from "react"
import styled, { css } from "styled-components"

export default function AllowedModes() {
  const { allowedModes, setAllowedModes } = useContext(RoutingContext)
  const [showFilters, setShowFilters] = useState(false)

  const toggleMode = (mode: RouteMode) => {
    if (allowedModes.includes(mode)) {
      setAllowedModes(allowedModes.filter(m => m !== mode))
    } else {
      setAllowedModes([...allowedModes, mode])
    }
  }

  return (
    <Wrapper>
      <FilterButton onClick={() => setShowFilters(!showFilters)}>
        Filter Search
      </FilterButton>
      {showFilters && (
        <Filters>
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
      )}
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
    default:
      return "Walk"
  }
}

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`

const FilterButton = styled.button`
  margin: 10px 30px;
  font-size: 16px;
  font-weight: 300;
  color: #999;
  cursor: pointer;
`

const Filters = styled.div`
  display: flex;
  gap: 20px;
`

const Selection = styled.div<{ active: boolean }>`
  background-color: #eee;
  padding: 20px 30px 20px 60px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, font-weight 0.2s ease-in-out,
    letter-spacing 0.2s ease-in-out;
  letter-spacing: 0.025em;
  position: relative;

  //check
  :before {
    content: "";
    position: absolute;
    top: calc(50% - 10px);
    left: 35px;
    width: 2px;
    height: 20px;
    background-color: #333;
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
    background-color: #333;
    rotate: -45deg;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;
  }

  // active
  ${({ active }) =>
    active &&
    css`
      background-color: #cff4d5;
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
