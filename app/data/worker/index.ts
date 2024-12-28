import { isWorker } from "app/utils/isBrowser"
import type { InternalFetchedData } from "./route"

if (!isWorker)
	throw new Error("gatelogue fetch was used in a non-worker environment")

// biome-ignore lint/suspicious/noExplicitAny: unsafe parsing - but it's all internal
function reviver(key: string, value: any) {
	if (typeof value === "object" && value !== null) {
		if (value.dataType === "Map") {
			return new Map(value.value)
		}
	}
	return value
}

export const fetchData = async () => {
	if (!isWorker)
		throw new Error("gatelogue fetch was used in a non-worker environment")
	const data = await fetch("/data/worker", {
		priority: "low",
	}).then((res) => res.text())

	return JSON.parse(data, reviver) as InternalFetchedData
}
