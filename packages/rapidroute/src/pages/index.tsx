import React from "react"

import styled from "styled-components"

import Header from "components/Header"
import Layout from "components/Layout"
import Results from "components/Results"
import Selection from "components/Selection"
import SEO from "components/SEO"
import { isBrowser } from "utils/functions"
import { wrap } from "utils/promise-worker"
import type { WorkerFunctions } from "utils/testworker"

const worker = isBrowser() && new Worker(new URL("utils/testworker", import.meta.url))

async function run() {
  if (!worker) return
  
  // Create the worker & wrapper
  const wrapper = await wrap<WorkerFunctions>(worker)

  // Use the worker
  const a = 2;
    const b = 5

  const added = await wrapper.add(2, 5)
  const multiplied = await wrapper.multiply(2, 5)

  console.log(`${a} + ${b} = ${added}`)
  console.log(`${a} * ${b} = ${multiplied}`)

  // Terminate the worker
  wrapper.terminate()
}

if (isBrowser()) run()

export default function Home() {
  return (
    <Layout>
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
  margin-top: 200px;
  margin-bottom: 50px;
`

const Strong = styled.span`
  font-weight: 700;
`
