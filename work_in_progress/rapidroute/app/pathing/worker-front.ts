import type { findPath } from "."

const worker =
	typeof window === "undefined"
		? null
		: new Worker(new URL("./worker-back.ts", import.meta.url))

type Output =
	| {
			result: ReturnType<typeof findPath>
			id: string
	  }
	| {
			error: unknown
			id: string
	  }

/**
 * find a path between two locations in a web worker
 */
export const findPathInWorker = (
	from: string | undefined,
	to: string | undefined,
) => {
	if (!from || !to) return null

	const id = crypto.randomUUID()

	worker?.postMessage({
		from,
		to,
		id,
	})

	return new Promise<ReturnType<typeof findPath>>((resolve, reject) => {
		worker?.addEventListener("message", (event) => {
			const data = event.data as Output
			if (data.id !== id) return

			if ("result" in data) {
				resolve(data.result)
			} else {
				reject(data.error)
			}
		})
	})
}
