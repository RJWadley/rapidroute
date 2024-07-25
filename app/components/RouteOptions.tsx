"use client"

import { styled } from "@linaria/react"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { useRouting } from "./RoutingContext"

export default function RouteOptions() {
	const { routes, isLoading, setPreferredRoute } = useRouting()
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")

	if (isLoading) return <Wrapper>loading...</Wrapper>
	if (!from || !to) return null
	if (!routes) return null
	if (routes?.length === 0) return <Wrapper>no routes found</Wrapper>

	return (
		<Wrapper>
			the following options are available:
			{routes.map((route, index) => (
				<button
					type="button"
					key={route.id}
					onClick={() => setPreferredRoute(index)}
				>
					route number {index + 1}
				</button>
			))}
		</Wrapper>
	)
}

const Wrapper = styled.div`
background: white;
`
