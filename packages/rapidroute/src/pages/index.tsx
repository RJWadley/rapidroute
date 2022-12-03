import React from "react"

import styled from "styled-components"

import ControlsOverlay from "components/ControlsOverlay"
import Header from "components/Header"
import Layout from "components/Layout"
import Results from "components/Results"
import Selection from "components/Selection"
import SEO from "components/SEO"

export default function Home() {
  return (
    <Layout>
      <ControlsOverlay />
      <Header />
      <Content>
        <Title>
          <Strong>MRT</Strong> Route Finder
        </Title>
        <Selection />
        <Results />
      </Content>
    </Layout>
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
