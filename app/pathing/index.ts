import { compressedPlaces } from "app/utils/compressedPlaces"
import { findClosestPlace } from "app/utils/search"
import { type ExcludedRoutes, type Place, places } from "app/data"
import PriorityQueue from "../utils/PriorityQueue"
import { compressResult } from "./compressResult"
import { convertToRoutes } from "./convertToRoutes"
import { getNeighbors } from "./getNeighbors"
import hash from "object-hash"
import { combineWalks } from "./combineWalks"

export type RoutingResult = { path: Place[]; time: number }

/**
 * this is where the magic happens! we do some dijkstra's algorithm to find the shortest path
 * between two locations
 */
export const findPath = (
	from: string | null | undefined,
	to: string | null | undefined,
	excludedRoutes: ExcludedRoutes,
) => {
	if (!from || !to) return null
	if (from === to) return null

	const startID = findClosestPlace(from, compressedPlaces)?.id
	const endID = findClosestPlace(to, compressedPlaces)?.id

	if (!startID) return null
	if (!endID) return null

	const start = places.list.find((x) => x.pretty_id === startID)
	const end = places.list.find((x) => x.pretty_id === endID)

	if (!start) return null
	if (!end) return null

	const frontier = new PriorityQueue<string>()
	const cameFrom = new Map<string, Set<string>>()
	const timesSoFar = new Map<string, number>()
	const timesCache: Record<string, number> = {}

	frontier.enqueue(start.i, 0)
	timesSoFar.set(start.i, 0)

	// while there are nodes to visit
	while (!frontier.isEmpty()) {
		const currentId = frontier.dequeue()
		if (!currentId) break

		// if we've reached the end, exit the loop (we've found the path)
		if (currentId === end.i) break

		const neighbors = getNeighbors(currentId, excludedRoutes)

		for (const neighbor of neighbors) {
			const { placeId, time } = neighbor
			timesCache[`${currentId}${placeId}`] = time

			// for each neighbor, we want to calculate the time (cost) to get there
			// if we haven't visited the neighbor yet, we add it to the frontier
			// if we have visited the neighbor, we check if the new path is faster
			// if it is, we update the path and add it to the frontier
			// otherwise it's slower, so we ignore it

			const timeSoFar = timesSoFar.get(currentId)
			// if there is no timeSoFar, we have a bug
			if (timeSoFar === undefined)
				throw new Error(
					`could not find time so far for current place: ${places.map.get(currentId)?.name}`,
				)
			const newTime = timeSoFar + time

			// if we haven't visited the neighbor yet, add it to the frontier
			const oldTime = timesSoFar.get(placeId)
			if (!oldTime) {
				frontier.enqueue(placeId, newTime)
				timesSoFar.set(placeId, newTime)
				cameFrom.set(placeId, new Set([currentId]))
			}
			// otherwise, if we have visited the neighbor, check if the new path is faster and update accordingly (see above)
			else {
				if (newTime === oldTime) {
					// add this location if it's not already in there
					const list = cameFrom.get(placeId) ?? new Set()
					list.add(currentId)
					cameFrom.set(placeId, list)
				} else if (newTime < oldTime) {
					frontier.enqueue(placeId, newTime)
					timesSoFar.set(placeId, newTime)
					cameFrom.set(placeId, new Set([currentId]))
				}
			}
		}
	}

	const totalTimeToDestination = timesSoFar.get(end.i)

	// if there is no totalTimeToDestination, there's no path to the destination
	if (!totalTimeToDestination) return []

	// now that we have the path, lets reconstruct it
	// some things to note:
	// typically, we would only reconstruct a single path with dijkstra's algorithm
	// but I want all the viable paths
	// so when pathfinding, use a more vague time for each step - this will allow us to find more paths
	// because more paths will return the same time
	// then, when sorting them for display, use a more precise time
	// TODO sort paths based on gate presence and time

	const pathsInProgress: RoutingResult[] = [{ path: [end], time: 0 }]
	const completedPaths: RoutingResult[] = []

	while (pathsInProgress.length > 0) {
		const nextPath = pathsInProgress.pop()
		if (!nextPath) break

		const currentPlace = nextPath.path[0]
		if (!currentPlace) continue

		const currentCameFrom = cameFrom.get(currentPlace.i) ?? []

		const newPaths: RoutingResult[] = Array.from(currentCameFrom)
			.map((placeId) => ({
				path: [places.map.get(placeId), ...nextPath.path].filter(
					(x) => x !== undefined,
				),
				time:
					nextPath.time +
					(timesCache[`${placeId}${currentPlace.i}`] ??
						Number.POSITIVE_INFINITY),
			}))
			// filter out invalid paths
			.filter(({ path }) => {
				// every place in the path must only be included once
				// because it doesn't make sense to go from A to B and then back to A
				// this shouldn't happen - but if it did we get an infinite loop
				// so it's important to filter out
				const uniquePlaces = new Set(path.map((x) => x.i))
				return uniquePlaces.size === path.length
			})

		for (const newPath of newPaths) {
			if (newPath.time > totalTimeToDestination) continue
			if (newPath.path[0]?.i === start.i) {
				completedPaths.push(newPath)
			} else {
				pathsInProgress.push(newPath)
			}
		}
	}

	if (completedPaths.length === 0)
		throw new Error(
			`Reconstruction failed! Path was between ${start.pretty_id} and ${end.pretty_id}`,
		)

	return (
		completedPaths
			.map(convertToRoutes)
			.map(combineWalks)
			.map(compressResult)
			.map((x) => ({
				...x,
				id: hash(x),
			}))
			// filter out duplicates - we can take advantage of the id being a hash
			.filter((x, i, arr) => arr.findIndex((y) => x.id === y.id) === i)
	)
}
