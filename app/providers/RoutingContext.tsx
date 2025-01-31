"use client"

import { useQuery } from "@tanstack/react-query"
import type { ExcludedRoutes } from "app/data"
import type { findPath } from "app/pathing/index"
import { exclusionPresets } from "app/pathing/presets"
import { findPathInServer } from "app/pathing/server-front"
import { findPathInWorker } from "app/pathing/worker-front"
import { useOnlinePlayers } from "app/utils/onlinePlayers"
import { racePromisesWithLog } from "app/utils/racePromisesWithLog"
import { useBetterThrottle } from "app/utils/useBetterThrottle"
import { useParams, useRouter } from "next/navigation"
import { createContext, startTransition, use, useState } from "react"

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
	/**
	 * actual route information
	 */
	fromID: string | null
	toID: string | null
	setFromID: (newFromID: string | null | undefined) => void
	setToID: (newToID: string | null | undefined) => void
}

const routingContext = createContext<ContextType>({
	status: "pending",
	routes: undefined,
	isError: false,
	isPending: true,
	preferredRoute: undefined,
	setPreferredRoute: () => {},
	excludedRoutes: exclusionPresets.default,
	updateExcludedRoutes: () => {},
	fromID: null,
	toID: null,
	setFromID: () => {},
	setToID: () => {},
})

export const useRouting = () => {
	return use(routingContext)
}

export function RoutingProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const { segments } = useParams<{
		segments: undefined | string[]
	}>()
	const [routeType, placeId, navigateFirstId, _, navigateSecondId] =
		segments?.map((x) => decodeURIComponent(x)) ?? []
	const currentRoute =
		routeType === "place" && placeId
			? // /place/to
				({
					type: "place",
					toID: placeId,
					fromID: null,
				} as const)
			: routeType === "navigate" && navigateFirstId && navigateSecondId
				? ({
						// /navigate/from/to
						type: "navigate",
						fromID: navigateFirstId,
						toID: navigateSecondId,
					} as const)
				: routeType === "navigate" && navigateFirstId
					? ({
							// /navigate/from
							type: "navigate",
							toID: null,
							fromID: navigateFirstId,
						} as const)
					: ({
							// /
							type: "root",
							toID: null,
							fromID: null,
						} as const)

	const router = useRouter()

	const updateRoute = (
		fromID: string | null | undefined,
		toID: string | null | undefined,
	) => {
		const encodedFrom = fromID
		const encodedTo = toID
		const currentSearchParams = window.location.search
		if (fromID && toID) {
			router.push(
				`/navigate/from/${encodedFrom}/to/${encodedTo}${currentSearchParams}`,
			)
		} else if (fromID) {
			router.push(`/navigate/from/${encodedFrom}${currentSearchParams}`)
		} else if (toID) {
			router.push(`/place/${encodedTo}${currentSearchParams}`)
		} else {
			router.push(`/${currentSearchParams}`)
		}
	}

	const setToID = (newToID: string | null | undefined) => {
		updateRoute(currentRoute.fromID, newToID)
	}
	const setFromID = (newFromID: string | null | undefined) => {
		updateRoute(newFromID, currentRoute.toID)
	}

	const [preferredRoute, setPreferredRoute] = useState<number>()
	const [excludedRoutes, setExcludedRoutes] = useState(exclusionPresets.default)
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
	const fromPlayer =
		players && currentRoute.fromID
			? players[currentRoute.fromID]?.position
			: null
	const toPlayer =
		players && currentRoute.toID ? players[currentRoute.toID]?.position : null

	const from = useBetterThrottle(fromPlayer ?? currentRoute.fromID, 1000)
	const to = useBetterThrottle(toPlayer ?? currentRoute.toID, 1000)

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
				fromID: currentRoute.fromID,
				toID: currentRoute.toID,
				setFromID,
				setToID,
			}}
		>
			{children}
		</routingContext.Provider>
	)
}
