export default function getTileUrl(coords: {
  x: number
  z: number
  zoom: number
}) {
  const Zcoord = 2 ** (8 - coords.zoom)
  const Xcoord = coords.x * 1
  const Ycoord = coords.z * -1

  const group = {
    x: Math.floor((Xcoord * Zcoord) / 32),
    y: Math.floor((Ycoord * Zcoord) / 32),
  }

  const numberInGroup = {
    x: Math.floor(Xcoord * Zcoord),
    y: Math.floor(Ycoord * Zcoord),
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
