import SuperJSON from "superjson"
import * as data from "../format"

export type InternalFetchedData = typeof data

export const dynamic = "force-static"

export const GET = () => {
	return new Response(SuperJSON.stringify(data), {
		headers: {
			"content-type": "application/json",
		},
	})
}
