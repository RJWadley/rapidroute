"use client"

import { useQuery } from "@tanstack/react-query"
import type { findPath } from "app/pathing"
import { findPathInServer } from "app/pathing/server-front"
import { findPathInWorker } from "app/pathing/worker-front"
import { racePromisesWithLog } from "app/utils/racePromisesWithLog"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { createContext, useContext, useState } from "react"

const routingContext = createContext<{
	routes: ReturnType<typeof findPath> | undefined
	preferredRoute: number | undefined
	setPreferredRoute: (route: number | undefined) => void
	isLoading: boolean
}>({
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

	const { isLoading, data } = useQuery({
		queryKey: ["find-path", from, to],
		queryFn: () =>
			racePromisesWithLog([
				{ promise: findPathInWorker(from, to), name: "worker" },
				{ promise: findPathInServer(from, to), name: "server" },
			]),
	})

	return (
		<routingContext.Provider
			value={{
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
