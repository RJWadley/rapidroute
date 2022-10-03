import React from "react"

import styled from "styled-components"

import MapCanvas from "map/MapCanvas"

export default function MapTest() {
  return (
    <Wrapper>
      <MapCanvas />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  overscroll-behavior: none;
`
