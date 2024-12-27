"use client"

import { useQuery } from "@tanstack/react-query"
import type { ExcludedRoutes } from "app/data"
import type { findPath } from "app/pathing"
import { findPathInServer } from "app/pathing/server-front"
import { findPathInWorker } from "app/pathing/worker-front"
import { racePromisesWithLog } from "app/utils/racePromisesWithLog"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { createContext, startTransition, use, useState } from "react"

const defaultExcludedRoutes: ExcludedRoutes = {
	AirFlight: {
		helicopter: false,
		seaplane: false,
		unk: false,
		warpPlane: false,
	},
	RailLine: { unk: false, warp: false },
	SeaLine: { ferry: false, unk: false },
	BusLine: { unk: false },
	Walk: { unk: false },
	SpawnWarp: {
		portal: false,
		premier: false,
		terminus: false,
		misc: false,
	},
}

const routingContext = createContext<{
	routes: ReturnType<typeof findPath> | undefined
	preferredRoute: number | undefined
	setPreferredRoute: (route: number | undefined) => void
	isLoading: boolean
	isError: boolean
	excludedRoutes: ExcludedRoutes
	updateExcludedRoutes: <T extends keyof ExcludedRoutes>(action: {
		type: T
		mode: keyof ExcludedRoutes[T]
		value: boolean
	}) => void
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
	const [excludedRoutes, setExcludedRoutes] = useState(defaultExcludedRoutes)
	const updateExcludedRoutes = <T extends keyof ExcludedRoutes>(action: {
		type: T
		mode: keyof ExcludedRoutes[T]
		value: boolean
	}) => {
		setExcludedRoutes((prev) => ({
			...prev,
			[action.type]: { ...prev[action.type], [action.mode]: action.value },
		}))
	}

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
