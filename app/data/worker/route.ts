import SuperJSON from "superjson"
import * as data from "../format"

export type InternalFetchedData = typeof data

export const dynamic = "error"

export const GET = () => {
	return new Response(SuperJSON.stringify(data), {
		headers: {
			"content-type": "application/json",
		},
	})
}
