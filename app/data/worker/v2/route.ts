import * as data from "../../format"
import { serializeWorkerData } from "../transport"

export const dynamic = "error"

export function GET() {
	return new Response(serializeWorkerData(data), {
		headers: { "content-type": "application/json" },
	})
}
