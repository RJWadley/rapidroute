import type { ExcludedRoutes } from "app/data"
import { wrap } from "comlink"
import type { WorkerOut } from "./worker-back"

const { findPathInternal } =
	typeof Worker === "undefined"
		? {}
		: wrap<WorkerOut>(new Worker(new URL("./worker-back.ts", import.meta.url)))

/**
 * find a path between two locations in a web worker
 */
export const findPathInWorker = async (
	from: string | undefined | null,
	to: string | undefined | null,
	excludedRoutes: ExcludedRoutes,
) => {
	if (!from || !to) return null

	const result = await findPathInternal?.({
		from,
		to,
		excludedRoutes,
	})

	return result
}
