import SuperJSON from "superjson"
import * as data from "../format"

export type { InternalFetchedData } from "./transport"

export const dynamic = "error"

// Keep already-open tabs using the original worker protocol working across deploys.
const serializer = new SuperJSON({ dedupe: true })

export const GET = () => {
	return new Response(serializer.stringify({ ...data }), {
		headers: {
			"content-type": "application/json",
		},
	})
}
