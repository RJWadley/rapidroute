export default function getTileUrl(coords: {
  xIn: number
  zIn: number
  zoom: number
}) {
  const zoomFactor = 2 ** (8 - coords.zoom)
  const x = coords.xIn * 1
  const y = coords.zIn * -1

  const group = {
    x: Math.floor((x * zoomFactor) / 32),
    y: Math.floor((y * zoomFactor) / 32),
  }

  const numberInGroup = {
    x: Math.floor(x * zoomFactor),
    y: Math.floor(y * zoomFactor),
  }

  let zzz = ""

  for (let i = 8; i > coords.zoom; i -= 1) {
    zzz += "z"
  }

  if (coords.zoom !== 8) zzz += "_"

  const url = `https://dynmap.minecartrapidtransit.net/tiles/new/flat/${group.x}_${group.y}/${zzz}${numberInGroup.x}_${numberInGroup.y}.png`

  return {
    id: `${group.x}.${group.y}.${zzz}.${numberInGroup.x}.${numberInGroup.y}`,
    url,
  }
}
