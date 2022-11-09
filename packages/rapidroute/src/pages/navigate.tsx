import React, { useEffect } from "react"

import styled from "styled-components"

import Layout from "components/Layout"
import SEO from "components/SEO"
import MapCanvas from "map/MapCanvas"
import NavigationSidebar from "navigation/NavigationSidebar"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import { getLocal } from "utils/localUtils"

export default function Navigate() {
  useEffect(() => {
    if (isBrowser() && !getLocal("selectedPlayer"))
      loadRoute("/select-player?redirect=navigate")
  }, [])

  return (
    <Layout>
      <NavigationSidebar />
      <StyledCanvas />
    </Layout>
  )
}

export function Head() {
  return <SEO />
}

const StyledCanvas = styled(MapCanvas)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`