"use client"

import { styled } from "@pigment-css/react"
import { useRouting } from "./RoutingContext"

export default function RouteOptions() {
	const { routes, isLoading, setPreferredRoute } = useRouting()

	if (!routes) return <Wrapper>no search yet</Wrapper>
	if (isLoading) return <Wrapper>loading...</Wrapper>
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
