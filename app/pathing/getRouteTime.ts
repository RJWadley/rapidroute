/**
 * get the duration, in seconds, of a route
 * based on its physical properties
 */
export const getRouteTime = (
	props:
		| { type: "flight" }
		| { type: "walk"; distance: number }
		| { type: "RailLine" | "SeaLine" | "BusLine" | undefined; mode?: "cart" },
) => {
	switch (props.type) {
		case "flight":
			return 60 * 4
		case "walk":
			return props.distance / 4
		case "RailLine":
			return 30
		case "SeaLine":
			return 60
		case "BusLine":
			return 30
		default:
			props.type satisfies undefined
			return Number.POSITIVE_INFINITY
	}
}
