import React, { useContext, useEffect } from "react"

import styled from "styled-components"

import Layout from "components/Layout"
import { NavigationContext } from "components/Providers/NavigationContext"
import SEO from "components/SEO"
import MapCanvas from "map/MapCanvas"
import NavigationSidebar from "navigation/NavigationSidebar"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import { getLocal } from "utils/localUtils"

export default function Navigate() {
  const { preferredRoute } = useContext(NavigationContext)

  /**
   * select a player if none is selected
   */
  useEffect(() => {
    if (isBrowser() && !getLocal("selectedPlayer"))
      loadRoute("/select-player?redirect=navigate")
  }, [])

  /**
   * exit the page if the user is not navigating
   */
  if (isBrowser() && preferredRoute.length === 0) {
    loadRoute("/")
  }

  return (
    <Layout>
      <StyledCanvas />
      <NavigationSidebar />
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
`