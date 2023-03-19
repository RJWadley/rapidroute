import Changelog from "components/ChangelogCasing"
import ControlsOverlay from "components/ControlsOverlay/ControlsOverlay"
import Header from "components/Header"
import SEO from "components/SEO"

export default function ChangelogPage() {
  return (
    <>
      <ControlsOverlay />
      <Header />
      <Changelog />
    </>
  )
}

export function Head() {
  return <SEO />
}
