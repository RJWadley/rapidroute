"use client"

import { styled } from "@linaria/react"
import { useQuery } from "@tanstack/react-query"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { findClosestPlace } from "app/utils/search"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { getArticleContent } from "./getArticleContent"
import { AnimatePresence, motion } from "motion/react"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

export default function WikiArticle({
	places,
}: {
	places: CompressedPlace[]
}) {
	const [placeID] = useSearchParamState("to")
	const relevantPlace = findClosestPlace(placeID, places)
	const name = relevantPlace?.name || relevantPlace?.id || placeID

	const { data, isLoading } = useQuery({
		queryKey: ["wiki-article", name],
		enabled: !!name,
		queryFn: async () => {
			if (!name) throw new Error("no title")
			return getArticleContent(name)
		},
	})

	const state = !name
		? "empty"
		: isLoading
			? "loading"
			: !data?.content
				? "404"
				: "success"

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
				{state === "success" && data?.type === "generic" && (
					<motion.h2 {...layout} key="generic">
						May be related to {data.title}
					</motion.h2>
				)}
				{state === "success" && data?.type === "specific" && (
					<motion.h1 {...layout} key="specific">
						{data.title}
					</motion.h1>
				)}
				{state === "success" && (
					<motion.div key="content" {...layout}>
						<Wrapper
							className="infobox-wrap"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{ __html: data?.content ?? "no text" }}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

const Wrapper = styled.div`
	max-width: 100%;
	overflow:clip;

	/* hide navigation */
	.toc {
		display: none;
	}
`
