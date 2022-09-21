import React, { useContext, useState } from "react"

import { RoutingContext } from "components/Providers/RoutingContext"
import { search } from "data/search"

import styled from "styled-components"
import media from "utils/media"
import SearchBox from "./SearchBox"
import SearchList from "./SearchList"
import SwapButton from "./SwapButton"
import AllowedModes from "./AllowedModes"

type LocationId = string

export default function Selection() {
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)
  const [mostRecentRole, setMostRecentRole] = useState<"from" | "to">("from")
  const { setTo, setFrom } = useContext(RoutingContext)
  const [filteredLocations, setFilteredLocations] = useState<LocationId[]>([])
  const [showSearchList, setShowSearchList] = useState(false)

  const runSearch = async (text: string) => {
    setSelectedLocationIndex(0)
    return setFilteredLocations(search(text))
  }

  const processKeyPress = (
    key: string,
    box: React.RefObject<HTMLTextAreaElement>,
    role: "from" | "to"
  ) => {
    runSearch(box.current?.value ?? "")
    setMostRecentRole(role)

    if (key === "Enter" || key === "Blur") {
      setTimeout(() => setShowSearchList(false), 200)
      let selected: LocationId | null = filteredLocations[selectedLocationIndex]
      if (box?.current?.value === "") selected = null

      updateSelected(selected)
    }

    if (key === "Focus") {
      setTimeout(() => setShowSearchList(true), 200)
    }

    if (key === "ArrowDown") {
      if (selectedLocationIndex < Object.keys(filteredLocations).length - 1) {
        setSelectedLocationIndex(selectedLocationIndex + 1)
      }
    }

    if (key === "ArrowUp") {
      if (selectedLocationIndex > 0) {
        setSelectedLocationIndex(selectedLocationIndex - 1)
      }
    }
  }

  const selectionClick = (index: number) => {
    setSelectedLocationIndex(index)
    updateSelected(filteredLocations[index])
  }

  const updateSelected = (newSelection: LocationId | null) => {
    if (mostRecentRole === "from") {
      setFrom(newSelection)
    } else {
      setTo(newSelection)
    }
  }

  return (
    <div>
      <SearchContainer>
        <SearchBox
          searchText={runSearch}
          sendKey={(a, b) => processKeyPress(a, b, "from")}
          searchRole="from"
        />
        <SearchBox
          searchText={runSearch}
          sendKey={(a, b) => processKeyPress(a, b, "to")}
          searchRole="to"
        />
        <SwapButton />
      </SearchContainer>
      <SearchList
        locations={filteredLocations}
        currentlySelected={selectedLocationIndex}
        setSelectedIndex={selectionClick}
        show={showSearchList}
      />
      <AllowedModes />
    </div>
  )
}

const SearchContainer = styled.div`
  background-color: #eee;
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 100px;
  border-radius: 30px;
  grid-template-areas: "from swap to";

  > label:nth-child(2) {
    text-align: right;
  }

  @media (max-width: ${media.small}px) {
    grid-template-columns: 1fr auto;
    grid-template-areas: "from swap" "to swap";
    height: 80px;
    border-radius: 25px;
    padding-right: 15px;

    > label:nth-child(2) {
      text-align: left;
    }
  }
`
