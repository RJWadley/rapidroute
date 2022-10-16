import React, { useEffect } from "react"

import { navigate } from "gatsby-link"
import styled from "styled-components"

import Layout from "components/Layout"
import NavigationSidebar from "components/NavigationSidebar"
import SEO from "components/SEO"
import MapCanvas from "map/MapCanvas"
import { isBrowser } from "utils/functions"
import { getLocal } from "utils/localUtils"

export default function Navigate() {
  useEffect(() => {
    if (isBrowser() && !getLocal("selectedPlayer"))
      navigate("/select-player?redirect=navigate")
  }, [])

  return (
    <Layout>
      <Wrapper>
        <NavigationSidebar />
        <MapCanvas />
      </Wrapper>
    </Layout>
  )
}

export function Head() {
  return <SEO />
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  height: 100vh;
`
