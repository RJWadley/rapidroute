import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Providers } from "../providers"
import { HydrationBoundary } from "@tanstack/react-query"
import { styled } from "restyle"
import { MapServer } from "../components/Map/Server"

import "../global.css"
import { Suspense } from "react"

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>RapidRoute</title>
			</head>
			<body
				style={{ fontWeight: 300, fontFamily: "Inter, system-ui, sans-serif" }}
				// for theme cookie
				suppressHydrationWarning
			>
				<Providers>
					<Application>
						<MapServer />
						<Suspense fallback={null}>
							<Outlet />
						</Suspense>
					</Application>
				</Providers>
			</body>
		</html>
	)
}

const Application = styled("div", {
	width: "100dvw",
	height: "100dvh",
	overflow: "clip",
	display: "grid",
	gridTemplateColumns: "1fr 1fr 1fr",
	placeItems: "start stretch",
})
