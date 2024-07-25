"use client"

import { styled } from "@linaria/react"
import { useQuery } from "@tanstack/react-query"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { findClosestPlace } from "app/utils/search"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { getArticleContent } from "./getArticleContent"

export default function WikiArtile({
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

	if (!name) return null
	if (isLoading) return "loading..."
	if (!data?.content) return "no articles found"

	return (
		<>
			{data.type === "generic" && (
				<>
					<h2>May be related to {data.title}</h2>
				</>
			)}
			{data.type === "specific" && <h1>{data.title}</h1>}
			<Wrapper
				className="infobox-wrap"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{ __html: data.content ?? "no text" }}
			/>
		</>
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
