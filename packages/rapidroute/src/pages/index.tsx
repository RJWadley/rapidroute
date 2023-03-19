import styled from "styled-components"

import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import NavHistory from "components/ControlsOverlay/NavHistory"
import Header from "components/Header"
import OfflineBanner from "components/OfflineBanner"
import Results from "components/Results"
import Selection from "components/Selection"
import SEO from "components/SEO"

export default function Home() {
  return (
    <>
      <ControlsOverlay>
        <NavHistory />
      </ControlsOverlay>
      <Header />
      <OfflineBanner />
      <Content>
        <Title>
          <Strong>MRT</Strong> Route Finder
        </Title>
        <Selection />
        <Results />
      </Content>
    </>
  )
}

const Content = styled.div`
  max-width: calc(100vw - 40px);
  margin: 0 auto;
`

export function Head() {
  return <SEO />
}

const Title = styled.div`
  text-align: center;
  font-size: var(--large);
  margin-top: 110px;
  margin-bottom: 50px;
`

const Strong = styled.span`
  font-weight: 700;
`
