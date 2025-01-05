export default function getTileUrl(
	coords: {
		xIn: number
		zIn: number
		zoom: number
	},
	isometric: boolean,
) {
	const zoomFactor = 2 ** (8 - coords.zoom)
	const x = Number(coords.xIn)
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

	return `https://dynmap.minecartrapidtransit.net/main/tiles/new/${
		isometric ? "surface" : "flat"
	}/${group.x}_${group.y}/${zzz}${numberInGroup.x}_${numberInGroup.y}.png`
}
