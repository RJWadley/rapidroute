"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import type { WikiContext } from "app/api/getWikiContent/input"
import { useTRPC } from "app/api/trpc/client"
import { useLocalGeneratedOverviews } from "app/utils/locals"
import { useState } from "react"
import Box from "../Box"
import {
	WikiArticleBox,
	WikiControls,
	WikiEmpty,
	WikiLoading,
	WikiResult,
} from "./WikiGuide"
import useWikiDestination from "./useWikiDestination"

export default function WikiArticle() {
	const input = useWikiDestination()
	const [overviewsEnabled] = useLocalGeneratedOverviews()
	if (!input || overviewsEnabled === null) return null
	return (
		<DestinationGuide
			key={input.context?.id ?? input.name}
			input={input}
			enabled={overviewsEnabled}
		/>
	)
}

export function WikiPreferences() {
	const input = useWikiDestination()
	const [overviewsEnabled, setOverviewsEnabled] = useLocalGeneratedOverviews()
	if (!input) return null
	return (
		<WikiControls
			name={input.name}
			enabled={overviewsEnabled}
			onChange={setOverviewsEnabled}
		/>
	)
}

function DestinationGuide({
	input,
	enabled,
}: { input: { name: string; context?: WikiContext }; enabled: boolean }) {
	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const article = useQuery(
		trpc.wikiArticle.queryOptions(input, {
			enabled: !enabled,
			staleTime: 86400000,
			retry: false,
		}),
	)
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
			enabled: enabled && !failed && (data === undefined || retrying),
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
	return (
		<>
			{enabled && (
				<Box animated={false}>
					{data ? (
						<WikiResult
							data={data}
							name={input.name}
							retrying={retrying}
							onRetry={retry}
							progress={progress}
						/>
					) : failed ? (
						<WikiEmpty name={input.name} error onRetry={retry} />
					) : data === null && !retrying ? (
						<WikiEmpty name={input.name} onRetry={retry} />
					) : (
						<WikiLoading name={input.name} progress={progress} />
					)}
				</Box>
			)}
			<WikiArticleBox
				data={enabled ? (data ?? article.data) : article.data}
				name={input.name}
				collapsible={enabled}
				pending={!enabled && article.isPending}
				error={!enabled && article.isError}
				onRetry={() => void article.refetch()}
			/>
		</>
	)
}
