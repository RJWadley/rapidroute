"use client"
import { styled } from "@linaria/react"

import { runImport } from "./updater"
// TODO finish import
// import Header from "components/Header"
// import Layout from "components/Layout"
// import Results from "components/Results"
// import Selection from "components/Selection"
// import Seo from "components/SEO"

export default function Home() {
  return (
    <Content>
      <Title onClick={() => runImport()}>
        <Strong>MRT</Strong> Route Finder
      </Title>
      {/* <Selection />
      <Results /> */}
    </Content>
  )
}

const Content = styled.div`
  max-width: calc(100vw - 40px);
  margin: 0 auto;
`

const Title = styled.div`
  text-align: center;
  font-size: var(--large);
  margin-top: 110px;
  margin-bottom: 50px;
`

const Strong = styled.span`
  font-weight: 700;
`
