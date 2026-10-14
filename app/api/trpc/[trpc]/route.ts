import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "../app"
import { compressedPlacesResponseMeta } from "../cache"
import { createTRPCContext } from "../init"

export const maxDuration = 90

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: createTRPCContext,
		responseMeta: (opts) => compressedPlacesResponseMeta(req, opts),
	})

export { handler as GET, handler as POST }
