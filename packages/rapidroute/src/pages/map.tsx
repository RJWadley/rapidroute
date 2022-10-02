import React, { useEffect } from "react"

import styled from "styled-components"

import MapCanvas from "map/MapCanvas"
import { isBrowser } from "utils/functions"

export default function MapTest() {
  const [showMap, setShowMap] = React.useState(false)

  useEffect(() => {
    if (isBrowser()) setShowMap(true)
  }, [])

  return <Wrapper>{showMap && <MapCanvas />}</Wrapper>
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  overscroll-behavior: none;
`
