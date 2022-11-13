import React, { useContext, useEffect } from "react"

import styled from "styled-components"

import Layout from "components/Layout"
import { NavigationContext } from "components/Providers/NavigationContext"
import SEO from "components/SEO"
import MapCanvas from "map/MapCanvas"
import NavigationSidebar from "navigation/NavigationSidebar"
import { isBrowser } from "utils/functions"
import loadRoute from "utils/loadRoute"
import { getLocal, session } from "utils/localUtils"
import media from "utils/media"
import useMedia from "utils/useMedia"

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

  /**
   * update map padding
   */
  const mobile = useMedia(media.mobile)
  useEffect(() => {
    const updatePadding = () => {
      if (mobile) {
        session.cameraPadding = {
          top: 120,
          left: 0,
          right: 0,
          bottom: window.innerHeight * 0.3 + 20,
        }
      } else {
        session.cameraPadding = {
          top: 0,
          left: 370,
          right: 0,
          bottom: 0,
        }
      }
    }
    updatePadding()
    window.addEventListener("resize", updatePadding)
    return () => window.removeEventListener("resize", updatePadding)
  }, [mobile])

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
