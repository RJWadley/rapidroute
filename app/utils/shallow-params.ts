import { useRef } from "react"

type ShallowParams = {
	x: number
	z: number
	zoom: number
}

/**
 * shallow params are params where we only ever read the value once
 * we don't care about updates to the value at all
 */
export const getShallowParam = (key: keyof ShallowParams): number => {
	const params = new URLSearchParams(window.location.search)
	const value = Number.parseFloat(params.get(key) ?? "")

	return Number.isNaN(value) ? 0.5 : value
}

let params: URLSearchParams | null = null
let scheduledUpdate: ReturnType<typeof setTimeout> | null = null
export const setShallowParam = (
	key: keyof ShallowParams,
	value: string | null,
) => {
	params ||= new URLSearchParams(window.location.search)

	if (!value) params.delete(key)
	else params.set(key, value.toString())

	/**
	 * schedule an update
	 */
	if (scheduledUpdate) clearTimeout(scheduledUpdate)
	scheduledUpdate = setTimeout(() => {
		if (!params) return
		scheduledUpdate = null

		const url = new URL(window.location.href)
		url.search = params.toString()
		const newURL = url.toString()
		if (newURL !== window.location.href) {
			window.history.replaceState({}, "", newURL)
		}
	}, Date.now() % 1000)
}
