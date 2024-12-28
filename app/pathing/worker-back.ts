import { fetchData } from "app/data/worker"
import { findPath } from "."
import type { ExcludedRoutes } from "app/data"

export type WorkerInput = {
	from: string
	to: string
	id: string
	excludedRoutes: ExcludedRoutes
}

export type WorkerOutput =
	| {
			id: string
			result: ReturnType<typeof findPath>
	  }
	| {
			id: string
			error: unknown
	  }

const data = fetchData()

self.addEventListener("message", async (event) => {
	try {
		const { from, to, id, excludedRoutes } = event.data as WorkerInput

		const result = findPath(from, to, excludedRoutes, await data)

		self.postMessage({
			id,
			result,
		})
	} catch (error) {
		self.postMessage({
			id: event.data.id,
			error,
		})
	}
})
