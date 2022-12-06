import React from "react"

import styled from "styled-components"

import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import Layout from "components/Layout"
import MapBackground from "map/MapBackground"
import MapCanvas from "map/MapCanvas"
import MapTag from "map/MapTag"

export default function MapTest() {
  return (
    <Layout>
      <ControlsOverlay />
      <Wrapper>
        <MapBackground />
        <MapCanvas />
        <StyledMapTag />
      </Wrapper>
    </Layout>
  )
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: black;
  overscroll-behavior: none;
  position: relative;
`

const StyledMapTag = styled(MapTag)`
  position: fixed;
  bottom: 7px;
  right: 7px;
  z-index: 1;
`
