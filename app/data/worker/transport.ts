import type * as data from "../format"

export type InternalFetchedData = typeof data

/** Send each node once. JSON omits unused undefined fields; indexes stay local. */
type WorkerPayload = {
	places: InternalFetchedData["places"]["list"]
	gates: InternalFetchedData["gates"]["list"]
	flights: InternalFetchedData["flights"]["list"]
	companies: InternalFetchedData["companies"]["list"]
	connectionLines: InternalFetchedData["connectionLines"]["list"]
	spawn: string
}

export function serializeWorkerData(data: InternalFetchedData): string {
	return JSON.stringify({
		places: data.places.list,
		gates: data.gates.list,
		flights: data.flights.list,
		companies: data.companies.list,
		connectionLines: data.connectionLines.list,
		spawn: data.spawn.i,
	} satisfies WorkerPayload)
}

function indexNodes<T extends { i: string }>(list: T[]) {
	return { list, map: new Map(list.map((node) => [node.i, node])) }
}

export function parseWorkerData(body: string): InternalFetchedData {
	const payload = JSON.parse(body) as WorkerPayload
	const places = indexNodes(payload.places)
	const spawn = places.map.get(payload.spawn)
	if (!spawn || spawn.type !== "Town")
		throw new Error("Worker dataset is missing its spawn town")

	return {
		places,
		gates: indexNodes(payload.gates),
		flights: indexNodes(payload.flights),
		companies: indexNodes(payload.companies),
		connectionLines: indexNodes(payload.connectionLines),
		spawn,
		// Warps and spawn must reference the same objects as the places lookup.
		spawnWarps: indexNodes(
			places.list.filter((place) => place.type === "SpawnWarp"),
		),
	}
}
