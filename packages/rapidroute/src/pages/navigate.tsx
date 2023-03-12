import { useContext, useEffect } from "react"

import styled from "styled-components"

import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import NavigationOverview from "components/ControlsOverlay/NavigationOverview"
import Layout from "components/Layout"
import NavigationSidebar from "components/navigation/NavigationSidebar"
import { NavigationContext } from "components/Providers/NavigationContext"
import SEO from "components/SEO"
import Map from "map"
import MapBackground from "map/MapBackground"
import MapTag from "map/MapTag"
import { isBrowser } from "utils/functions"
import { loadPage } from "utils/Loader/TransitionUtils"
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
      loadPage("/select-player?redirect=navigate", "slide").catch(console.error)
  }, [])

  /**
   * exit the page if the user is not navigating
   */
  if (isBrowser() && preferredRoute.length === 0) {
    loadPage("/").catch(console.error)
  }

  /**
   * update map padding
   */
  const mobile = useMedia(media.mobile)
  useEffect(() => {
    const updatePadding = () => {
      const padding = 100
      if (mobile) {
        session.cameraPadding = {
          top: 120 + padding,
          left: 0 + padding,
          right: 0 + padding,
          bottom: window.innerHeight * 0.4 + 20 + padding,
        }
      } else {
        session.cameraPadding = {
          top: 0 + padding,
          left: 370 + padding,
          right: 0 + padding,
          bottom: 0 + padding,
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
      <ControlsOverlay fillBackground={false}>
        <NavigationOverview />
      </ControlsOverlay>
      <MapBackground />
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

const StyledCanvas = styled(Map)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
`
