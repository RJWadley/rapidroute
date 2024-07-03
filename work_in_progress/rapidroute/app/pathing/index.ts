import { places, type Place } from "../data"
import PriorityQueue from "../utils/PriorityQueue"
import { convertToRoutes } from "./convertToRoutes"
import { getNeighbors } from "./getNeighbors"
import { getRouteTime } from "./getRouteTime"

export type RoutingResult = { path: Place[]; time: number }

export const findPath = (from: string, to: string) => {
	const startTime = performance.now()

	const start = places.map.get(from)
	const end = places.map.get(to)
	if (!start) return null
	if (!end) return null

	// djistra's algorithm
	const frontier = new PriorityQueue<string>()
	const cameFrom = new Map<string, string[]>()
	const timesSoFar = new Map<string, number>()

	frontier.enqueue(start.id, 0)
	timesSoFar.set(start.id, 0)

	// while there are nodes to visit
	while (!frontier.isEmpty()) {
		const currentId = frontier.dequeue()
		if (!currentId) break

		// if we've reached the end, exit the loop (we've found the path)
		if (currentId === end.id) break

		const neighbors = getNeighbors(currentId)

		for (const neighbor of neighbors) {
			const { placeId, time } = neighbor

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
				cameFrom.set(placeId, [currentId])
			}
			// otherwise, if we have visited the neighbor, check if the new path is faster and update accordingly (see above)
			else {
				if (newTime === oldTime) {
					// add this location if it's not already in there
					const list = cameFrom.get(placeId) ?? []
					if (!list.includes(currentId)) {
						list.push(currentId)
						cameFrom.set(placeId, list)
					}
				} else if (newTime < oldTime) {
					frontier.enqueue(placeId, newTime)
					timesSoFar.set(placeId, newTime)
					cameFrom.set(placeId, [currentId])
				}
			}
		}
	}

	const totalTimeToDestination = timesSoFar.get(end.id)

	// if there is no totalTimeToDestination, there's no path to the destination
	if (!totalTimeToDestination) return null

	// now that we have the path, lets reconstruct it
	// some things to note:
	// typically, we would only reconstruct a single path with djistra's algorithm
	// but I want all the possible paths within ALLOWABLE_TIME_DIFFERENCE
	// so construct all possible paths and filter out the ones that are too slow

	const pathsInProgress: RoutingResult[] = [{ path: [end], time: 0 }]
	const completedPaths: RoutingResult[] = []

	while (pathsInProgress.length > 0) {
		const nextPath = pathsInProgress.pop()
		if (!nextPath) break

		const currentPlace = nextPath.path[0]
		if (!currentPlace) continue

		const currentCameFrom = cameFrom.get(currentPlace.id) ?? []

		const newPaths: RoutingResult[] = currentCameFrom.map((placeId) => ({
			path: [places.map.get(placeId), ...nextPath.path].filter(
				(x) => x !== undefined,
			),
			time: nextPath.time + getRouteTime(places.map.get(placeId), currentPlace),
		}))

		for (const newPath of newPaths) {
			if (newPath.time > totalTimeToDestination) continue
			if (newPath.path[0]?.id === start.id) {
				completedPaths.push(newPath)
			} else {
				pathsInProgress.push(newPath)
			}
		}
	}

	const endTime = performance.now()

	console.log(
		"completed paths",
		`took ${endTime - startTime}ms`,
		completedPaths.map((x) => ({
			time: x.time,
			path: x.path
				.map((a) => (a.type === "airport" ? a.code : a.name))
				.join(" -> "),
		})),
	)

	return completedPaths
		.map(convertToRoutes)
		.map((x) => ({ ...x, id: Math.random() }))
}
