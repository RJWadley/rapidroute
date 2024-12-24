"use client"

import { useQuery } from "@tanstack/react-query"
import type { ExcludedRoutes } from "app/data"
import type { findPath } from "app/pathing"
import { findPathInServer } from "app/pathing/server-front"
import { findPathInWorker } from "app/pathing/worker-front"
import { racePromisesWithLog } from "app/utils/racePromisesWithLog"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { createContext, startTransition, useContext, useState } from "react"

const routingContext = createContext<{
	routes: ReturnType<typeof findPath> | undefined
	preferredRoute: number | undefined
	setPreferredRoute: (route: number | undefined) => void
	isLoading: boolean
	isError: boolean
}>({
	isError: false,
	isLoading: false,
	routes: [],
	setPreferredRoute: () => {},
	preferredRoute: undefined,
})

export const useRouting = () => {
	return useContext(routingContext)
}

export function RoutingProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")
	const [preferredRoute, setPreferredRoute] = useState<number>()

	// TODO - mode ui

	const excludeRoutes: ExcludedRoutes = {
		AirFlight: false,
		RailLine: false,
		SeaLine: false,
		BusLine: false,
		Walk: false,
		ferrySeaLine: false,
		warpRailLine: false,
	}

	const { isLoading, data, isError } = useQuery({
		queryKey: ["find-path", from, to],
		queryFn: () => {
			if (!from || !to) return null
			if (from === to) return null
			return racePromisesWithLog([
				{ promise: findPathInWorker(from, to, excludeRoutes), name: "worker" },
				{ promise: findPathInServer(from, to, excludeRoutes), name: "server" },
			]).finally(() => {
				startTransition(() => {
					setPreferredRoute(undefined)
				})
			})
		},
	})

	return (
		<routingContext.Provider
			value={{
				isError,
				isLoading,
				routes: data,
				preferredRoute,
				setPreferredRoute,
			}}
		>
			{children}
		</routingContext.Provider>
	)
}
