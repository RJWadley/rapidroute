import React from "react"

import styled from "styled-components"

import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import Layout from "components/Layout"
import MapCanvas from "map"
import MapBackground from "map/MapBackground"
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
  overscroll-behavior: none;
  position: relative;
  /* 
  ::after {
    content: "";
    position: absolute;
    top: 100px;
    left: 100px;
    width: calc(100% - 200px);
    height: calc(100% - 200px);
    border: 1px solid red;
    pointer-events: none;
  } */
`

const StyledMapTag = styled(MapTag)`
  position: fixed;
  bottom: 7px;
  right: 7px;
  z-index: 1;
`
