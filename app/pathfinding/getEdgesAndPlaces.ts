import type { PlaceType, RouteType } from "@prisma/client"
import { prisma } from "data/client"

import { getDistance } from "./distance"
import getRouteTime from "./getRouteTime"

export interface GraphEdge {
  from: string
  to: string
  weight: number
  route?: string
  type: RouteType
  sortWeight?: number
}

export interface GraphPlace {
  type: PlaceType
  id: string
  coordinate_x: number | null
  coordinate_z: number | null
}

export const getEdgesAndPlaces = async (allowedMode: RouteType[]) => {
  // create leg edges
  const legs = await prisma.routeLeg.findMany({
    include: {
      route: {
        select: {
          type: true,
          id: true,
        },
      },
      fromPlace: {
        select: {
          id: true,
          coordinate_x: true,
          coordinate_z: true,
        },
      },
      toPlace: {
        select: {
          id: true,
          coordinate_x: true,
          coordinate_z: true,
        },
      },
    },
  })

  const edges = legs
    .flatMap((leg) => {
      if (!leg.fromPlace || !leg.toPlace) return []
      const fromX = leg.fromPlace.coordinate_x ?? Infinity
      const fromZ = leg.fromPlace.coordinate_z ?? Infinity
      const toX = leg.toPlace.coordinate_x ?? Infinity
      const toZ = leg.toPlace.coordinate_z ?? Infinity
      const hasFromGate = Boolean(leg.fromGate)
      const hasToGate = Boolean(leg.toGate)
      const type = leg.route?.type
      const routeId = leg.route?.id

      if (!type || !routeId) return []

      const numberOfGates = Number(hasFromGate) + Number(hasToGate)

      return [
        {
          from: leg.fromPlace.id,
          to: leg.toPlace.id,
          type,
          weight: getRouteTime(getDistance(fromX, fromZ, toX, toZ), type),
          sortWeight: getRouteTime(
            getDistance(fromX, fromZ, toX, toZ),
            type,
            numberOfGates
          ),
          route: routeId,
        },
        {
          from: leg.toPlace.id,
          to: leg.fromPlace.id,
          type,
          weight: getRouteTime(getDistance(fromX, fromZ, toX, toZ), type),
          sortWeight: getRouteTime(
            getDistance(fromX, fromZ, toX, toZ),
            type,
            numberOfGates
          ),
          route: routeId,
        },
      ] satisfies [GraphEdge, GraphEdge]
    })
    .filter(Boolean)

  // create walking edges
  const allPlaces = await prisma.place.findMany({
    select: {
      type: true,
      coordinate_x: true,
      coordinate_z: true,
      id: true,
      _count: { select: { routeFroms: true, routeTos: true } },
    },
  })

  // create spoke edges
  const spokes = await prisma.routeSpoke.findMany({
    include: {
      route: {
        select: {
          type: true,
          id: true,
        },
      },
      place: {
        select: {
          id: true,
          coordinate_x: true,
          coordinate_z: true,
        },
      },
    },
  })

  // each spoke edge goes to all other spoke edges on the same route
  const spokeEdges = spokes.flatMap((spoke) => {
    const fromX = spoke.place.coordinate_x ?? Infinity
    const fromZ = spoke.place.coordinate_z ?? Infinity
    const type = spoke.route?.type
    const routeId = spoke.route?.id

    if (!type || !routeId) return []

    return spokes
      .filter((otherSpoke) => otherSpoke.routeId === spoke.routeId)
      .map((otherSpoke) => {
        const toX = otherSpoke.place.coordinate_x ?? Infinity
        const toZ = otherSpoke.place.coordinate_z ?? Infinity
        const distance = getDistance(fromX, fromZ, toX, toZ)
        const weight = getRouteTime(distance, type)

        return {
          from: spoke.place.id,
          to: otherSpoke.place.id,
          type,
          weight,
          route: routeId,
        } satisfies GraphEdge
      })
  })

  // for each node, generate 5 walking edges to the closest nodes
  const walkingEdges: GraphEdge[] = allPlaces.flatMap((from) => {
    const x1 = from.coordinate_x
    const z1 = from.coordinate_z

    return (
      allPlaces
        .filter((to) => to !== from)
        .map((to) => {
          const x2 = to.coordinate_x
          const z2 = to.coordinate_z
          const distance =
            x1 && z1 && x2 && z2 ? getDistance(x1, z1, x2, z2) : Infinity
          return { to, distance }
        })
        .sort((a, b) => a.distance - b.distance)
        // only include locations which have at least one route available at them
        .filter(({ to }, i) => {
          if (i === 0) return true // keep the closest location regardless

          const count = to._count.routeFroms + to._count.routeTos
          return count > 0
        })
        .slice(0, 5)
        .flatMap(({ to, distance }) => {
          const weight = getRouteTime(distance, "Walk")

          const type: RouteType =
            from.type === "MrtStation" &&
            to.type === "MrtStation" &&
            getDistance(
              from.coordinate_x ?? Infinity,
              from.coordinate_z ?? Infinity,
              to.coordinate_x ?? Infinity,
              to.coordinate_z ?? Infinity
            ) < 200
              ? "MRT"
              : "Walk"

          return [
            { from: from.id, to: to.id, weight, type } satisfies GraphEdge,
            { to: from.id, from: to.id, weight, type } satisfies GraphEdge,
          ]
        })
    )
  })

  // todo add spawn warp edges & coordinate edges

  return {
    edges: [...edges, ...spokeEdges, ...walkingEdges].filter((edge) =>
      allowedMode.includes(edge.type)
    ),
    places: allPlaces,
  }
}
