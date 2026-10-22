import AppGrid from "app/components/AppGrid"
import { MapClient } from "components/Map/Client"
import { Suspense } from "react"

/**
 * the map and route panels persist across every routing segment
 * (see ./[[...segments]]/page.tsx)
 */
export default function RoutingLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			{children}
			<Suspense fallback={null}>
				<MapClient />
				<AppGrid />
			</Suspense>
		</>
	)
}
