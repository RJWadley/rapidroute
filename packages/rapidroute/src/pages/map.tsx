import { useEffect } from "react"

import { navigate } from "@reach/router"
import styled from "styled-components"

import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import Layout from "components/Layout"
import MapSidebar from "components/MapSidebar"
import SEO from "components/SEO"
import Settings from "components/Settings"
import Map from "map"
import MapBackground from "map/MapBackground"
import MapTag from "map/MapTag"
import { defaultPadding } from "map/zoomCamera"
import { session } from "utils/localUtils"
import media from "utils/media"

export default function MapPage() {
  useEffect(() => {
    session.cameraPadding = defaultPadding
  }, [])

  return (
    <Layout>
      <ControlsOverlay />
      <SettingsWrapper>
        <Settings />
      </SettingsWrapper>
      <MapBackground />
      <button
        onClick={() => {
          navigate("/").catch(console.error)
        }}
        type="button"
      >
        <StyledMapTag />
      </button>
      <Map />
      <MapSidebar />
    </Layout>
  )
}

const SettingsWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  padding: 20px;
  z-index: 2;

  @media ${media.mobile} {
    top: 5px;
    right: 5px;
  }
`

const StyledMapTag = styled(MapTag)`
  position: fixed;
  bottom: 7px;
  right: 7px;
  z-index: 1;
`

export function Head() {
  return <SEO />
}
