import * as data from "../format"

export type InternalFetchedData = typeof data

function replacer(key: string, value: unknown) {
	if (value instanceof Map) {
		return {
			dataType: "Map",
			value: Array.from(value.entries()), // or with spread: value: [...value]
		}
	}

	return value
}

export const dynamic = "force-static"

export const GET = () => {
	return new Response(JSON.stringify(data, replacer), {
		headers: {
			"content-type": "application/json",
		},
	})
}
