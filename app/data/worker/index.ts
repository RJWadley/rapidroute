import { isWorker } from "app/utils/isBrowser"
import { parseWorkerData } from "./transport"

if (!isWorker)
	throw new Error("gatelogue fetch was used in a non-worker environment")

export const fetchData = async () => {
	if (!isWorker)
		throw new Error("gatelogue fetch was used in a non-worker environment")

	const data = await fetch(`${self.location.origin}/data/worker/v2`, {
		priority: "low",
	}).then((res) => res.text())

	return parseWorkerData(data)
}
