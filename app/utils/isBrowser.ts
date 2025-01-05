export const isBrowser = typeof window !== "undefined"
export const isServer = !isBrowser
export const isWorker =
	// @ts-expect-error
	typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope
