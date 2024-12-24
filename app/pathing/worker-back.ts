import type { ExcludedRoutes } from "app/data"
import { findPath } from "."

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

self.addEventListener("message", (event) => {
	try {
		const { from, to, id, excludedRoutes } = event.data as WorkerInput

		const result = findPath(from, to, excludedRoutes)

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
