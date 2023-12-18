import { prisma } from "../../database/client"
import mergeData from "../utils/mergeData"

type CreateManyArgs<T extends keyof typeof prisma> =
  (typeof prisma)[T] extends {
    createMany: (args: { data: (infer U)[] }) => unknown
  }
    ? U
    : never

export type BarePlace = CreateManyArgs<"place"> & { id: string }
export type BareCompany = CreateManyArgs<"company"> & { id: string }
export type BareRoute = CreateManyArgs<"route"> & { id: string }
export type BareRouteLeg = CreateManyArgs<"routeLeg">

const database: {
  place: Record<string, BarePlace>
  company: Record<string, BareCompany>
  route: Record<string, BareRoute>
  routeLeg: BareRouteLeg[]
} = {
  place: {},
  company: {},
  route: {},
  routeLeg: [],
}

export const updateRoute = (route: BareRoute) => {
  const previousRoute = database.route[route.id]
  database.route[route.id] = mergeData(previousRoute, route)
}

export const updatePlace = (place: BarePlace) => {
  const previousPlace = database.place[place.id]
  database.place[place.id] = mergeData(previousPlace, place)
}

export const updateCompany = (company: BareCompany) => {
  const previousCompany = database.company[company.id]
  database.company[company.id] = mergeData(previousCompany, company)
}

export const updateRouteLeg = (connection: BareRouteLeg) => {
  // find connection where fromPlaceId and toPlaceId match
  const previousConnection = database.routeLeg.find(
    (conn) =>
      conn.fromPlaceId === connection.fromPlaceId &&
      conn.toPlaceId === connection.toPlaceId,
  )
  if (previousConnection) {
    const index = database.routeLeg.indexOf(previousConnection)
    database.routeLeg[index] = mergeData(previousConnection, connection)
  } else {
    database.routeLeg.push(connection)
  }
}

export const setupDatabase = async () => {
  // no setup needed for now, but this is where we could load the existing data
}

export const writeDatabase = async () => {
  const companies = Object.values(database.company)
  const places = Object.values(database.place)
  const routes = Object.values(database.route)

  await prisma.$transaction(
    async (tx) => {
      console.log("starting companies")
      await tx.company.deleteMany()
      await tx.company.createMany({
        data: companies,
      })
      console.log("saved", companies.length, "companies")

      console.log("starting places")
      await tx.place.deleteMany()
      await tx.place.createMany({
        data: places,
      })
      console.log("saved", places.length, "places")

      console.log("starting routes")
      await tx.route.deleteMany()
      await tx.route.createMany({
        data: routes,
      })
      console.log("saved", routes.length, "routes")

      console.log("starting route leg")
      await tx.routeLeg.deleteMany()
      await tx.routeLeg.createMany({
        data: database.routeLeg,
      })
      console.log("saved", database.routeLeg.length, "route legs")
    },
    {
      maxWait: 5 * 60 * 1000,
      timeout: 5 * 60 * 1000,
    },
  )
}
