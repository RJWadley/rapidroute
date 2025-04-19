import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"
import superjson from "superjson"

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// with SSR, we usually want to set some default staleTime above 0 to avoid refetching immediately on the client.
				staleTime: 30 * 1000,
			},
			dehydrate: {
				serializeData: superjson.serialize,
				// This is a function that determines whether a query should be dehydrated or not.
				// Since the RSC transport protocol supports hydrating promises over the network,
				// we extend the defaultShouldDehydrateQuery function to also include queries that
				// are still pending. This will allow us to start prefetching in a server component
				// high up the tree, then consuming that promise in a client component further down.
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: superjson.deserialize,
			},
		},
	})
}
