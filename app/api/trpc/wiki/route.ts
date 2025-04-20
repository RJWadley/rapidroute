import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createTRPCContext } from "../init"
import { appRouter } from "../app"

export const dynamic = "force-static"

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/wiki",
		req,
		router: appRouter,
		createContext: createTRPCContext,
	})

export { handler as GET, handler as POST }
