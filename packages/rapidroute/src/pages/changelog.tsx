import Changelog from "components/ChangelogCasing"
import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import Header from "components/Header"
import Layout from "components/Layout"
import SEO from "components/SEO"

export default function ChangelogPage() {
  return (
    <Layout>
      <ControlsOverlay />
      <Header />
      <Changelog />
    </Layout>
  )
}

export function Head() {
  return <SEO />
}
