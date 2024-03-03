import dynamic from "next/dynamic"

const MapBase = dynamic(() => import("./MapBase").then((mod) => mod.default), {
  ssr: false,
})

export default function Map() {
  return <MapBase />
}
