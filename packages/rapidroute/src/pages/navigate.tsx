import React from "react"

import Layout from "components/Layout"
import NavigationSidebar from "components/NavigationSidebar"
import SEO from "components/SEO"

export default function Navigate() {
  return (
    <Layout>
      <NavigationSidebar />
    </Layout>
  )
}

export function Head() {
  return <SEO />
}
