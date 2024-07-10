/**
 * get the duration, in seconds, of a route
 * based on its physical properties
 */
export const getRouteTime = (
	props:
		| { type: "flight" }
		| { type: "walk"; distance: number }
		| { type: "railline" | "sealine" | "busline" | undefined; mode?: "cart" },
) => {
	switch (props.type) {
		case "flight":
			return 60 * 4
		case "walk":
			return props.distance / 0.004
		case "railline":
			return 30
		case "sealine":
			return 60
		case "busline":
			return 30
		default:
			props.type satisfies undefined
			return Number.POSITIVE_INFINITY
	}
}
