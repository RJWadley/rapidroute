import { data } from "app/data"
import { resolveLogos } from "app/data/logos"
import { connection } from "next/server"

export const GET = async () => {
	// The live wiki must not be required for a production build to succeed.
	await connection()
	try {
		return Response.json(await resolveLogos(data), {
			headers: {
				"Cache-Control":
					"public, max-age=0, s-maxage=86400, stale-while-revalidate=3600",
			},
		})
	} catch (error) {
		console.error("Logo discovery failed", error)
		return Response.json(
			{ error: "Logos are temporarily unavailable" },
			{
				status: 503,
				headers: { "Cache-Control": "no-store", "Retry-After": "60" },
			},
		)
	}
}
