"use client"

import type { PlaceSearchItem } from "(temp)/components/TraditionalSelection/usePlaceSearch"
import { allRouteTypes } from "(temp)/data/helpers"
import { useSearchResults } from "(temp)/data/search"
import { useParamState } from "(temp)/utils/localUtils/useParamState"
import type { RouteType } from "@prisma/client"
import type { ReactNode } from "react"
import { createContext, useMemo, useState } from "react"

interface Place {
	id: string
}

const throwError = () => {
	throw new Error("no provider")
}

export const RoutingContext = createContext<{
	/**
	 * unique id of the origin location
	 */
	from: Place | null
	/**
	 * the destination location
	 * this is also the active location on the map, if in map view
	 */
	to: Place | null
	/**
	 * update the origin location
	 */
	setFrom: (from: Place | null) => void
	/**
	 * update the destination location
	 * this is also the active location on the map
	 */
	setTo: (to: Place | null) => void
	/**
	 * list of modes to use for routing
	 */
	allowedModes: readonly RouteType[]
	/**
	 * update the list of modes to use for routing
	 */
	setAllowedModes: (modes: RouteType[]) => void
}>({
	from: null,
	to: null,
	setFrom: throwError,
	setTo: throwError,
	allowedModes: allRouteTypes,
	setAllowedModes: throwError,
})

export function RoutingProvider({
	children,
	places,
}: {
	children: ReactNode
	places: PlaceSearchItem[]
}): JSX.Element {
	const [from, setFrom] = useParamState("from")
	const [to, setTo] = useParamState("to")
	const [allowedModes, setAllowedModes] = useState<readonly RouteType[]>(
		// TODO fix this
		// allRouteTypes.filter((m) => m !== "spawnWarp"),
		allRouteTypes,
	)

	const fromResult = useSearchResults(from, places)[0]
	const toResult = useSearchResults(to, places)[0]

	const value = useMemo(() => {
		const exactFrom = places.find((p) => p.id === from)
		const exactTo = places.find((p) => p.id === to)

		const externalSetFrom = (newFrom: Place | null) => {
			setFrom(newFrom?.id ?? null)
		}

		const externalSetTo = (newTo: Place | null) => {
			setTo(newTo?.id ?? null)
		}

		return {
			from: exactFrom ?? (from ? fromResult : null) ?? null,
			to: exactTo ?? (to ? toResult : null) ?? null,
			setFrom: externalSetFrom,
			setTo: externalSetTo,
			allowedModes,
			setAllowedModes,
		}
	}, [allowedModes, from, fromResult, places, setFrom, setTo, to, toResult])

	return (
		<RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
	)
}
