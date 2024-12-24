import type { ExcludedRoutes } from "app/data"
import type { findPath } from "."
import type { WorkerInput, WorkerOutput } from "./worker-back"

const worker =
	typeof window === "undefined"
		? null
		: new Worker(new URL("./worker-back.ts", import.meta.url))

/**
 * find a path between two locations in a web worker
 */
export const findPathInWorker = (
	from: string | undefined | null,
	to: string | undefined | null,
	excludedRoutes: ExcludedRoutes,
) => {
	if (!from || !to) return null

	const id = crypto.randomUUID()

	worker?.postMessage({
		from,
		to,
		id,
		excludedRoutes,
	} satisfies WorkerInput)

	return new Promise<ReturnType<typeof findPath>>((resolve, reject) => {
		worker?.addEventListener("message", (event) => {
			const data = event.data as WorkerOutput
			if (data.id !== id) return

			if ("result" in data) {
				resolve(data.result)
			} else {
				reject(data.error)
			}
		})
	})
}
