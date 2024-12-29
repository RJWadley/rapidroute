"use client"

import { styled } from "@linaria/react"
import { useQuery } from "@tanstack/react-query"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { findClosestPlace } from "app/utils/search"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { AnimatePresence, motion } from "motion/react"
import type { WikiResult } from "./getArticleContent/[name]/route"
import { Fragment } from "react"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

const components = {
	h1: styled.h1``,
	h2: styled.h2``,
	h3: styled.h3``,
	h4: styled.h4``,
	h5: styled.h5``,
	h6: styled.h6``,
	p: styled.p``,
	figure: styled.figure``,
	ol: styled.ol``,
	ul: styled.ul``,
	li: styled.li``,
}

export default function WikiArticle({
	places,
}: {
	places: CompressedPlace[]
}) {
	const [placeID] = useSearchParamState("to")
	const relevantPlace = findClosestPlace(placeID, places)

	const name =
		relevantPlace?.type === "Coordinate" || placeID?.startsWith("player-")
			? null
			: relevantPlace?.name || relevantPlace?.id || placeID

	const { data, isLoading } = useQuery({
		queryKey: ["wiki-article", name],
		enabled: !!name,
		queryFn: async () => {
			if (!name) throw new Error("no title")
			const content = await fetch(`/components/Wiki/getArticleContent/${name}`)
			const result = await content.json()
			return result as WikiResult
		},
	})

	const state = !name
		? "empty"
		: isLoading
			? "loading"
			: data?.type
				? "success"
				: "404"

	// TODO - allow wiki articles to manually specify content instead of using the generated summary

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
						{data?.mainImage && (
							<MainImage {...data.mainImage} alt={data?.title} />
						)}
						<Wrapper>
							{data?.content.map(({ figure, tagName, textContent }, index) => {
								const Component = components[tagName]
								const SubComponent =
									tagName === "ul" || tagName === "ol"
										? components.li
										: Fragment

								return (
									// biome-ignore lint/suspicious/noArrayIndexKey: none available
									<Component key={index}>
										{textContent?.map(
											({ reactStyleObject, text, href }, index) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: none available
												<SubComponent key={index}>
													{href ? (
														<a href={href} style={reactStyleObject}>
															{text}
														</a>
													) : (
														<span style={reactStyleObject}>{text}</span>
													)}
												</SubComponent>
											),
										)}
										{figure?.src && (
											<>
												<ContentImage
													src={figure.src}
													alt={figure.alt}
													width={figure.width}
													height={figure.height}
												/>
												<figcaption>
													{figure.caption.replaceAll(/\.$/g, "")}
												</figcaption>
											</>
										)}
									</Component>
								)
							})}
						</Wrapper>
						<a href={data?.url}>Read more on the MRT wiki</a>
						<p>
							Generated summary using "<a href={data?.url}>{data?.title}</a>" by
							Contributers to the MRT wiki under{" "}
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

const Wrapper = styled.div`
	max-width: 100%;
	overflow:clip;
	padding: 12px;
	
	h1:first-child {
		display: none;
	}
`

const MainImage = styled.img`
		width: 100%;
		height: auto;
		display: block;
`

const ContentImage = styled.img`
		width: 100%;
		height: auto;
		display: block;
`
