import React from "react"

import Layout from "components/Layout"
import Results from "components/Results"
import Selection from "components/Selection"
import SEO from "components/SEO"

export default function Home() {
  return (
    <Layout>
      <Selection />
      <Results />
    </Layout>
  )
}

export function Head() {
  return <SEO />
}
