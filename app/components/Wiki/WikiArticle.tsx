"use client"

import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { findClosestPlace } from "app/utils/search"
import { AnimatePresence, motion } from "motion/react"
import { Fragment } from "react"
import { styled } from "restyle"
import { useRouting } from "app/providers/RoutingContext"
import { useTRPC } from "app/api/trpc/client"
import { getLongName } from "app/utils/displayNames"
import DangerouslyRenderArticle from "./DangerouslyRenderArticle"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

const components = {
	h1: styled("h1"),
	h2: styled("h2"),
	h3: styled("h3"),
	h4: styled("h4"),
	h5: styled("h5"),
	h6: styled("h6"),
	p: styled("p"),
	figure: styled("figure"),
	ol: styled("ol"),
	ul: styled("ul"),
	li: styled("li"),
}

export default function WikiArticle() {
	const { toID: placeID } = useRouting()

	const trpc = useTRPC()
	const { data: compressedPlaces } = useSuspenseQuery(
		trpc.compressedPlaces.queryOptions(),
	)

	const relevantPlace = findClosestPlace(placeID, compressedPlaces)

	const name =
		relevantPlace?.type === "Coordinate" || placeID?.startsWith("player-")
			? null
			: relevantPlace?.name || relevantPlace?.id || placeID

	const { data, isLoading } = useQuery(
		trpc.wikiContent.queryOptions(
			{ name: name ?? "" },
			{
				enabled: !!name,
			},
		),
	)

	const state = !name
		? "empty"
		: isLoading
			? "loading"
			: data?.type
				? "success"
				: "404"

	return (
		<motion.div style={{ position: "relative" }}>
			<AnimatePresence mode="popLayout" initial={false}>
				{state === "loading" && (
					<motion.h1 {...layout} key="loading">
						loading...
					</motion.h1>
				)}
				{state === "404" && (
					<motion.h1 {...layout} key="404">
						no article found for '{placeID}'
					</motion.h1>
				)}
				{state === "success" && data && (
					<motion.div key="content" {...layout}>
						<MainImage src={data.mostProminentImage} alt={data.title} />
						<Wrapper>
							{data.type === "generic" && (
								<motion.h1 {...layout} key="generic">
									{getLongName(relevantPlace)} may be related to {data.title}
								</motion.h1>
							)}
							{data.type === "specific" && (
								<motion.h1 {...layout} key="specific">
									{data.title}
								</motion.h1>
							)}
							<p>{data.synopsis}</p>

							<DangerouslyRenderArticle content={data.content || ""} />
						</Wrapper>

						<p>
							"<a href={data.url}>{data.title}</a>" by Contributers to the MRT
							wiki under{" "}
							<a
								href="https://creativecommons.org/licenses/by-nc-sa/3.0/"
								style={{ whiteSpace: "nowrap" }}
							>
								CC BY-NC-SA 3.0
							</a>
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

const Wrapper = styled("div", {
	maxWidth: "100%",
	overflow: "clip",
	padding: "12px",

	"*": {
		userSelect: "text",
	},

	"h1:first-child": {
		display: "none",
	},
})

const MainImage = styled("img", {
	width: "100%",
	height: "auto",
	display: "block",
})
