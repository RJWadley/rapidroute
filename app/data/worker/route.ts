import SuperJSON from "superjson"
import * as data from "../format"

export type InternalFetchedData = typeof data

export const dynamic = "error"

// Lists and lookup maps share their nodes; send each object only once.
const serializer = new SuperJSON({ dedupe: true })

export const GET = () => {
	return new Response(serializer.stringify({ ...data }), {
		headers: {
			"content-type": "application/json",
		},
	})
}
