import { z } from "zod"
import { baseProcedure, createTRPCRouter } from "./init"
import { getCompressedPlaces } from "app/utils/compressedPlaces"
import { data } from "app/data"
import { getImageColor } from "app/utils/getImageColor"
import { getWikiContent } from "../getWikiContent"
import { getOfflinePlayers } from "../players/offline"
import { getOnlinePlayers } from "../players/online"

export const appRouter = createTRPCRouter({
	compressedPlaces: baseProcedure.query(() => getCompressedPlaces(data)),
	playerColor: baseProcedure
		.input(
			z.object({
				username: z.string(),
			}),
		)
		.query(({ input: { username } }) =>
			getImageColor(`https://mc-heads.net/avatar/${username}.png`),
		),
	wikiContent: baseProcedure
		.input(z.object({ name: z.string() }))
		.query(({ input: { name } }) => getWikiContent(name)),
	offlinePlayers: baseProcedure.query(() => getOfflinePlayers()),
	onlinePlayers: baseProcedure.query(() => getOnlinePlayers()),
})

export type AppRouter = typeof appRouter
