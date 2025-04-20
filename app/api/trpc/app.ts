import { z } from "zod"
import { baseProcedure, createTRPCRouter } from "./init"
import { getCompressedPlaces } from "app/utils/compressedPlaces"
import { data } from "app/data"
import { getWikiContent } from "../getWikiContent"
import { getOfflinePlayers } from "../players/offline"
import { getOnlinePlayers } from "../players/online"

export const appRouter = createTRPCRouter({
	compressedPlaces: baseProcedure.query(() => getCompressedPlaces(data)),
	wikiContent: baseProcedure
		.input(z.object({ name: z.string() }))
		.query(({ input: { name } }) => getWikiContent(name)),
	offlinePlayers: baseProcedure.query(() => getOfflinePlayers()),
})

export type AppRouter = typeof appRouter
