import React from "react"

import styled from "styled-components"

import Layout from "components/Layout"
import Results from "components/Results"
import Selection from "components/Selection"
import SEO from "components/SEO"

export default function Home() {
  return (
    <Layout>
      <Title>
        <Strong>MRT</Strong> Route Finder
      </Title>
      <Selection />
      <Results />
    </Layout>
  )
}

export function Head() {
  return <SEO />
}

const Title = styled.div`
  text-align: center;
  font-size: 40px;
  margin-top: 200px;
  margin-bottom: 50px;
`

const Strong = styled.span`
  font-weight: 700;
`
