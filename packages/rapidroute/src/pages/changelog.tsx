import React from "react"

import Changelog from "components/changelog"
import Header from "components/Header"
import Layout from "components/Layout"
import SEO from "components/SEO"

export default function ChangelogPage() {
  return   <Layout><Header /><Changelog /></Layout>
}

export function Head() {
  return <SEO />
}