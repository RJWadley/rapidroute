import Map from "components/Map"
import { Suspense } from "react"

export default function HomeView() {
  return (
    <Suspense fallback="loading map">
      <Map />
    </Suspense>
  )
}
