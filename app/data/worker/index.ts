import { isWorker } from "app/utils/isBrowser"
import type { InternalFetchedData } from "./route"
import SuperJSON from "superjson"

if (!isWorker)
	throw new Error("gatelogue fetch was used in a non-worker environment")

export const fetchData = async () => {
	if (!isWorker)
		throw new Error("gatelogue fetch was used in a non-worker environment")

	const data = await fetch(`${self.location.origin}/data/worker`, {
		priority: "low",
	}).then((res) => res.text())

	return SuperJSON.parse(data) as InternalFetchedData
}
