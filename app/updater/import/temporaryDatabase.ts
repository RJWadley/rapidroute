import { prisma } from "../../database/client"
import mergeData from "../utils/mergeData"

type CreateArgs<T extends keyof typeof prisma> = (typeof prisma)[T] extends {
  createMany: (args: { data: (infer U)[] }) => unknown
}
  ? U
  : never

export type BarePlace = CreateArgs<"place"> & { id: string }
export type BareCompany = CreateArgs<"company"> & { id: string }
export type BareRoute = CreateArgs<"route"> & { id: string }
export type BareConnection = CreateArgs<"routeConnection">

const database: {
  place: Record<string, BarePlace>
  company: Record<string, BareCompany>
  route: Record<string, BareRoute>
  connection: BareConnection[]
} = {
  place: {},
  company: {},
  route: {},
  connection: [],
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

export const updateConnection = (connection: BareConnection) => {
  database.connection.push(connection)
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

      console.log("starting connections")
      await tx.routeConnection.deleteMany()
      await tx.routeConnection.createMany({
        data: database.connection,
      })
      console.log("saved", database.connection.length, "connections")
    },
    {
      maxWait: 5 * 60 * 1000,
      timeout: 5 * 60 * 1000,
    },
  )
}
