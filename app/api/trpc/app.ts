import { data } from "app/data"
import { getCompressedPlaces } from "app/utils/compressedPlaces"
import { getWikiContent } from "../getWikiContent"
import { getWikiArticle } from "../getWikiContent/article"
import { wikiInputSchema } from "../getWikiContent/input"
import { streamWikiContent } from "../getWikiContent/stream"
import { getOfflinePlayers } from "../players/offline"
import { getOnlinePlayers } from "../players/online"
import { baseProcedure, createTRPCRouter } from "./init"

const placeLinks = new Map(
	data.places.list.flatMap((place) =>
		"link" in place && place.link
			? [[place.pretty_id, place.link] as const]
			: [],
	),
)

export const appRouter = createTRPCRouter({
	compressedPlaces: baseProcedure.query(() => getCompressedPlaces(data)),
	wikiContent: baseProcedure
		.input(wikiInputSchema)
		.query(({ input: { name, context } }) => getWikiContent(name, context)),
	wikiArticle: baseProcedure
		.input(wikiInputSchema)
		.query(({ input: { name, context } }) =>
			getWikiArticle(name, context, placeLinks.get(context?.id ?? "")),
		),
	wikiResearch: baseProcedure
		.input(wikiInputSchema)
		.subscription(({ input: { name, context }, signal }) =>
			streamWikiContent(name, context, signal),
		),
	offlinePlayers: baseProcedure.query(() => getOfflinePlayers()),
})

export type AppRouter = typeof appRouter
