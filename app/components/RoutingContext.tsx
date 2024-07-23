"use client"

import type { findPath } from "@/pathing"
import { findPathInServer } from "@/pathing/server-front"
import { useSearchParamState } from "@/utils/useSearchParamState"
import { useQuery } from "@tanstack/react-query"
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
	initialRoute,
}: {
	children: React.ReactNode
	initialRoute?: ReturnType<typeof findPath>
}) {
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")
	const [preferredRoute, setPreferredRoute] = useState<number>()

	console.log("context")
	const { isLoading, data } = useQuery({
		queryKey: ["route", from, to],
		queryFn: () => findPathInServer(from, to),
		initialData: initialRoute,
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
