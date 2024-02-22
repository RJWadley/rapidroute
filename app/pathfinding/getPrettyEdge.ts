import { Place, Route } from "@prisma/client"
import { prisma } from "database/client"

export const getPrettyEdge = async (fromId: string, toId: string) => {
  const fromPlace = await prisma.place.findUniqueOrThrow({
    where: { id: fromId },
  })
  const toPlace = await prisma.place.findUniqueOrThrow({
    where: { id: toId },
  })

  const relevantRoutes = await prisma.route.findMany({
    where: {
      OR: [
        {
          RouteSpoke: {
            some: {
              OR: [{ place: { id: fromId } }, { place: { id: toId } }],
            },
          },
        },
        {
          connections: {
            some: {
              OR: [{ fromPlace: { id: fromId }, toPlace: { id: toId } }],
            },
          },
        },
      ],
    },
  })

  return {
    from: fromPlace,
    to: toPlace,
    routes: relevantRoutes,
  }
}
