import { db } from "~/server/db"
import mergeData from "~/utils/mergeData"

type CreateManyArgs<T extends keyof typeof db> = (typeof db)[T] extends {
	createMany: (args: { data: (infer U)[] }) => unknown
}
	? U
	: never

export type BarePlace = CreateManyArgs<"place"> & { id: string }
export type BareCompany = CreateManyArgs<"company"> & { id: string }
export type BareRoute = CreateManyArgs<"route"> & { id: string }
export type BareRouteLeg = CreateManyArgs<"routeLeg">
export type BareSpoke = CreateManyArgs<"routeSpoke">

const database: {
	place: Record<string, BarePlace>
	company: Record<string, BareCompany>
	route: Record<string, BareRoute>
	routeLeg: BareRouteLeg[]
	routeSpoke: BareSpoke[]
} = {
	place: {},
	company: {},
	route: {},
	routeLeg: [],
	routeSpoke: [],
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

export const updateRouteLeg = (leg: BareRouteLeg) => {
	// find connection where fromPlaceId and toPlaceId match
	const previousConnection = database.routeLeg.find(
		(otherLeg) =>
			otherLeg.fromPlaceId === leg.fromPlaceId &&
			otherLeg.toPlaceId === leg.toPlaceId,
	)
	if (previousConnection) {
		const index = database.routeLeg.indexOf(previousConnection)
		database.routeLeg[index] = mergeData(previousConnection, leg)
	} else {
		database.routeLeg.push(leg)
	}
}

export const updateRouteSpoke = (spoke: BareSpoke) => {
	// find connection where place and route match
	const previousConnection = database.routeSpoke.find(
		(otherSpoke) =>
			otherSpoke.placeId === spoke.placeId &&
			otherSpoke.routeId === spoke.routeId,
	)
	if (previousConnection) {
		const index = database.routeSpoke.indexOf(previousConnection)
		database.routeSpoke[index] = mergeData(previousConnection, spoke)
	} else {
		database.routeSpoke.push(spoke)
	}
}

export const setupDatabase = async () => {
	// no setup needed for now, but this is where we could load the existing data
}

export const writeDatabase = async () => {
	const companies = Object.values(database.company)
	const places = Object.values(database.place)
	const routes = Object.values(database.route)

	await db.$transaction(
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

			console.log("starting route spoke")
			await tx.routeSpoke.deleteMany()
			await tx.routeSpoke.createMany({
				data: database.routeSpoke,
			})
			console.log("saved", database.routeSpoke.length, "route spokes")
		},
		{
			maxWait: 5 * 60 * 1000,
			timeout: 5 * 60 * 1000,
		},
	)
}
