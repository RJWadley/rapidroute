import type { ExcludedRoutes, RouteType } from "./format"

type Options =
	| keyof ExcludedRoutes
	| {
			[Type in keyof ExcludedRoutes]: `${Type}${keyof ExcludedRoutes[Type] & string}`
	  }[keyof ExcludedRoutes]

export const typeToString = (typeMode: string, short?: boolean) => {
	const typeModeEnum = typeMode as Options
	switch (typeModeEnum) {
		case "AirFlight":
			return short ? "Flight" : "Air Travel"
		case "RailLine":
			return short ? "Train" : "Rail Travel"
		case "SeaLine":
			return short ? "Boat" : "Water Travel"
		case "BusLine":
			return short ? "Bus" : "Bus Travel"
		case "Walk":
			return short ? "Walk" : "Walking Connections"
		case "SpawnWarp":
			return short ? "Warp" : "Teleportation"

		case "AirFlighthelicopter":
			return "Helicopters"
		case "AirFlightseaplane":
			return "Seaplanes"
		case "AirFlightwarpPlane":
			return "Standard Planes"
		case "AirFlightunk":
			return "Uncategorized"

		case "RailLinewarp":
			return "Warp Rail"
		case "RailLineunk":
			return "Uncategorized"
		case "RailLinecart":
			return "Minecarts"
		case "RailLinetraincarts":
			return "Traincarts"

		case "SeaLineferry":
			return "Ferries"
		case "SeaLineunk":
			return "Uncategorized"

		case "BusLineunk":
			return "Uncategorized"

		case "WalkatRouteStart":
			return "Walking as First Step"
		case "WalkatRouteEnd":
			return "Walking as Last Step"
		case "Walkmiddle":
			return "Other Walking"

		case "SpawnWarpportal":
			return "World Portals"
		case "SpawnWarppremier":
			return "Premier Cities"
		case "SpawnWarpterminus":
			return "Line Terminus"
		case "SpawnWarpmisc":
			return "Other Warps"

		default:
			typeModeEnum satisfies never
	}

	return `mode name not supported: ${typeMode}`
}
