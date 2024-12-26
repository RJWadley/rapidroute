"use client"

import { useQuery } from "@tanstack/react-query"
import type { ExcludedRoutes } from "app/data"
import type { findPath } from "app/pathing"
import { findPathInServer } from "app/pathing/server-front"
import { findPathInWorker } from "app/pathing/worker-front"
import { racePromisesWithLog } from "app/utils/racePromisesWithLog"
import { useSearchParamState } from "app/utils/useSearchParamState"
import {
	createContext,
	type Dispatch,
	startTransition,
	use,
	useReducer,
	useState,
} from "react"

const defaultExcludedRoutes: ExcludedRoutes = {
	SpawnWarp: false,
	AirFlight: false,
	RailLine: false,
	SeaLine: false,
	BusLine: false,
	Walk: false,
	ferrySeaLine: false,
	warpRailLine: false,
	helicopterAirFlight: false,
	seaplaneAirFlight: false,
	warpPlaneAirFlight: false,
}

const routingContext = createContext<{
	routes: ReturnType<typeof findPath> | undefined
	preferredRoute: number | undefined
	setPreferredRoute: (route: number | undefined) => void
	isLoading: boolean
	isError: boolean
	excludedRoutes: ExcludedRoutes
	updateExcludedRoutes: Dispatch<{
		type: "set"
		mode: keyof ExcludedRoutes
		value: boolean
	}>
}>({
	isError: false,
	isLoading: false,
	routes: [],
	setPreferredRoute: () => {},
	preferredRoute: undefined,
	excludedRoutes: defaultExcludedRoutes,
	updateExcludedRoutes: () => {},
})

export const useRouting = () => {
	return use(routingContext)
}

export function RoutingProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")
	const [preferredRoute, setPreferredRoute] = useState<number>()
	const [excludedRoutes, updateExcludedRoutes] = useReducer(
		(
			state: ExcludedRoutes,
			action: { type: "set"; mode: keyof ExcludedRoutes; value: boolean },
		) => {
			return {
				...state,
				[action.mode]: action.value,
			}
		},
		defaultExcludedRoutes,
	)

	// TODO - persist to URL

	const { isLoading, data, isError } = useQuery({
		queryKey: ["find-path", from, to, JSON.stringify(excludedRoutes)],
		queryFn: () => {
			if (!from || !to) return null
			if (from === to) return null
			return racePromisesWithLog([
				{ promise: findPathInWorker(from, to, excludedRoutes), name: "worker" },
				{ promise: findPathInServer(from, to, excludedRoutes), name: "server" },
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
				excludedRoutes,
				updateExcludedRoutes,
			}}
		>
			{children}
		</routingContext.Provider>
	)
}
