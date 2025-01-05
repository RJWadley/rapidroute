"use client"

import { useQuery } from "@tanstack/react-query"
import type { ExcludedRoutes } from "app/data"
import type { findPath } from "app/pathing"
import { findPathInServer } from "app/pathing/server-front"
import { findPathInWorker } from "app/pathing/worker-front"
import { useOnlinePlayers } from "app/utils/onlinePlayers"
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
	Walk: {
		atRouteStart: false,
		middle: false,
		atRouteEnd: false,
	},
	SpawnWarp: {
		portal: false,
		premier: false,
		terminus: false,
		misc: false,
	},
}

type NonEmptyArray<T> = [T, ...T[]]

type StatusUnion =
	| {
			status: "pending"
			routes?: undefined
			isPending: true
			isError: false
	  }
	| {
			status: "error"
			routes?: undefined
			isPending: false
			isError: true
	  }
	| {
			/**
			 * route was not worthy of searching - i.e. input data was incomplete
			 */
			status: "skipped"
			routes: null
			isPending: false
			isError: false
	  }
	| {
			/**
			 * we searched, but found no routes
			 */
			status: "404"
			routes: null
			isPending: false
			isError: false
	  }
	| {
			/**
			 * at least one result was found
			 */
			status: "success"
			routes: NonEmptyArray<NonNullable<ReturnType<typeof findPath>>[number]>
			isPending: false
			isError: false
	  }

type ContextType = StatusUnion & {
	/**
	 * highlighted, or 'preferred' route
	 */
	preferredRoute: number | undefined
	setPreferredRoute: (route: number | undefined) => void
	/**
	 * route types and modes to allow or exclude during pathing
	 */
	excludedRoutes: ExcludedRoutes
	updateExcludedRoutes: <T extends keyof ExcludedRoutes>(action: {
		type: T
		mode: keyof ExcludedRoutes[T]
		value: boolean
	}) => void
}

const routingContext = createContext<ContextType>({
	status: "pending",
	routes: undefined,
	isError: false,
	isPending: true,
	preferredRoute: undefined,
	setPreferredRoute: () => {},
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
	const [fromID] = useSearchParamState("from")
	const [toID] = useSearchParamState("to")
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

	const { data: players } = useOnlinePlayers()
	const fromPlayer = players && fromID ? players[fromID]?.position : null
	const toPlayer = players && toID ? players[toID]?.position : null

	const from = fromPlayer ?? fromID
	const to = toPlayer ?? toID

	const { status, data, isPending, isError } = useQuery({
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

	const [firstRoute, ...restRoutes] = data ?? []

	const statusUnion: StatusUnion =
		!from || !to
			? { status: "skipped", isPending: false, isError: false, routes: null }
			: status === "pending"
				? { status, isPending, isError }
				: status === "error"
					? { status, isPending, isError }
					: data === null
						? { status: "skipped", isPending, isError, routes: null }
						: firstRoute
							? {
									status: "success",
									routes: [firstRoute, ...restRoutes],
									isPending,
									isError,
								}
							: { status: "404", isError, isPending, routes: null }

	return (
		<routingContext.Provider
			value={{
				...statusUnion,
				excludedRoutes,
				updateExcludedRoutes,
				preferredRoute,
				setPreferredRoute,
			}}
		>
			{children}
		</routingContext.Provider>
	)
}
