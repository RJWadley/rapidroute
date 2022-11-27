import React, { useContext, useEffect } from "react"

import styled from "styled-components"

import Layout from "components/Layout"
import { NavigationContext } from "components/Providers/NavigationContext"
import SEO from "components/SEO"
import MapCanvas from "map/MapCanvas"
import MapTag from "map/MapTag"
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
          bottom: window.innerHeight * 0.4 + 20,
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

  /**
   * acquire a wake lock while the user is navigating
   */
  useEffect(() => {
    if (isBrowser() && "wakeLock" in navigator) {
      let wakeLock: WakeLockSentinel | undefined

      const acquireWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request("screen")
        } catch (err) {
          console.error("unable to acquire wake lock")
        }
      }

      acquireWakeLock().catch(() => {
        console.error("unable to acquire wake lock")
      })

      return () => {
        if (wakeLock) wakeLock.release().catch(console.error)
      }
    }
    return () => {}
  }, [])

  return (
    <Layout>
      <StyledMapTag />
      <StyledCanvas />
      <NavigationSidebar />
    </Layout>
  )
}

export function Head() {
  return <SEO />
}

const StyledMapTag = styled(MapTag)`
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1;

  @media ${media.mobile} {
    transform-origin: bottom right;
    transform: rotate(-90deg) translateX(100%);
    right: 2.5px;
    bottom: 5px;

    img {
      width: 15px;
      height: 15px;
    }
  }
`

const StyledCanvas = styled(MapCanvas)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
`
