"use client"

import {
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import type { WikiContext } from "app/api/getWikiContent/input"
import { useTRPC } from "app/api/trpc/client"
import { useRouting } from "app/providers/RoutingContext"
import { useLocalGeneratedOverviews } from "app/utils/locals"
import { findClosestPlace } from "app/utils/search"
import { useState } from "react"
import { WikiControls, WikiEmpty, WikiLoading, WikiResult } from "./WikiGuide"

export default function WikiArticle() {
	const { toID: placeID } = useRouting()
	const [overviewsEnabled, setOverviewsEnabled] = useLocalGeneratedOverviews()
	const trpc = useTRPC()
	const { data: compressedPlaces } = useSuspenseQuery(
		trpc.compressedPlaces.queryOptions(),
	)
	const place = findClosestPlace(placeID, compressedPlaces)
	const name =
		place?.type === "Coordinate" || placeID?.startsWith("player-")
			? null
			: place?.name || place?.id || placeID
	if (!name) return null
	const context: WikiContext =
		place && place.type !== "Coordinate"
			? {
					id: place.id,
					type: place.type,
					codes: place.codes,
					company: place.company?.name,
					world: place.world,
					coordinates: place.coordinates,
					mayor: place.mayor,
				}
			: undefined
	return (
		<>
			<WikiControls
				name={name}
				enabled={overviewsEnabled}
				onChange={setOverviewsEnabled}
			/>
			{overviewsEnabled === true && (
				<DestinationGuide key={placeID} input={{ name, context }} />
			)}
			{overviewsEnabled === false && (
				<WikiOnlyGuide key={placeID} input={{ name, context }} />
			)}
		</>
	)
}

function WikiOnlyGuide({
	input,
}: { input: { name: string; context?: WikiContext } }) {
	const trpc = useTRPC()
	const { data, isPending, isError, refetch } = useQuery(
		trpc.wikiArticle.queryOptions(input, { staleTime: 86400000, retry: false }),
	)
	if (isPending) return <WikiLoading name={input.name} mode="wiki" />
	if (isError)
		return (
			<WikiEmpty
				name={input.name}
				mode="wiki"
				error
				onRetry={() => void refetch()}
			/>
		)
	// The controls offer manual wiki search when the lookup finds no article.
	if (!data) return null
	return <WikiResult key={data.url} data={data} name={input.name} mode="wiki" />
}

function DestinationGuide({
	input,
}: { input: { name: string; context?: WikiContext } }) {
	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const options = trpc.wikiContent.queryOptions(input)
	// The subscription delivers progress and the result in one request. Keep the
	// result in the usual query cache so returning to a place is instantaneous.
	const { data } = useQuery({
		...options,
		enabled: false,
		staleTime: 86400000,
	})
	const [retrying, setRetrying] = useState(false)
	const [failed, setFailed] = useState(false)
	const subscription = useSubscription(
		trpc.wikiResearch.subscriptionOptions(input, {
			enabled: !failed && (data === undefined || retrying),
			onData: (event) => {
				if (event.type !== "result") return
				queryClient.setQueryData(options.queryKey, event.content)
				setRetrying(false)
			},
			onError: () => {
				setFailed(true)
				setRetrying(false)
			},
			onConnectionStateChange: ({ state, error }) => {
				if (state !== "connecting" || !error) return
				setFailed(true)
				setRetrying(false)
			},
		}),
	)
	const retry = () => {
		setFailed(false)
		setRetrying(true)
	}
	const progress =
		subscription.data?.type === "progress"
			? subscription.data.progress
			: undefined
	if (data)
		return (
			<WikiResult
				key={data.url}
				data={data}
				name={input.name}
				retrying={retrying}
				onRetry={retry}
				progress={progress}
			/>
		)
	if (failed) return <WikiEmpty name={input.name} error onRetry={retry} />
	if (data === null && !retrying) return <WikiEmpty name={input.name} />
	return <WikiLoading name={input.name} progress={progress} />
}
