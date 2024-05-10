import type { PrettyEdge } from "(temp)/pathfinding/getPrettyEdge"

// import { Location, Route } from "@rapidroute/database-types"

// export interface SegmentType {
//   from: Location
//   to: Location
//   routes: (Route | null)[]
// }

// export default function createSegments(
//   locations: (Location | null)[],
//   routes: (Route | null)[][]
// ) {
//   const segments: SegmentType[] = []
//   let passAlongMRT: Location | undefined

//   // for each pair of locations, create a segment
//   locations.forEach((to, i) => {
//     if (i === 0) return
//     const from = passAlongMRT ?? locations[i - 1]
//     const afterFrom = locations[i + 1]

//     const segmentRoutes = routes[i - 1] ?? []
//     const afterRoutes = routes[i] ?? []

//     if (
//       from?.type === "MRT Station" &&
//       to?.type === "MRT Station" &&
//       afterFrom?.type === "MRT Station" &&
//       segmentRoutes.length === 1 &&
//       afterRoutes.length === 1
//     ) {
//       // if there is only one route, pass along the MRT
//       passAlongMRT = from
//       return
//     }

//     if (from && to)
//       segments.push({
//         from,
//         to,
//         routes: segmentRoutes,
//       })
//     passAlongMRT = undefined
//   })

//   return segments
// }

export function combineMRT(input: PrettyEdge[]): PrettyEdge[] {
	// iterate through the results, and if two consecutive edges share a common route id, combine them

	const [firstEdge, secondEdge, ...rest] = input

	if (!firstEdge) return []
	if (!secondEdge) return [firstEdge]

	return firstEdge.routes.length === 1 &&
		secondEdge.routes.length === 1 &&
		firstEdge.routes[0]?.id === secondEdge.routes[0]?.id
		? combineMRT([
				{
					...firstEdge,
					to: secondEdge.to,
				},
				...rest,
			])
		: [firstEdge, ...combineMRT([secondEdge, ...rest])]
}
