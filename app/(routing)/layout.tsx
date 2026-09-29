import AppGrid from "app/components/AppGrid"
import { MapServer } from "components/Map/Server"

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
			<MapServer />
			<AppGrid>{children}</AppGrid>
		</>
	)
}
