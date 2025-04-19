import type { ExcludedRoutes } from "app/data"

export const exclusionPresets = {
	default: {
		AirFlight: {
			warpPlane: false,
			helicopter: false,
			seaplane: false,
			unk: false,
		},
		RailLine: { warp: false, cart: false, traincarts: false, unk: false },
		SeaLine: { ferry: false, unk: false },
		BusLine: { unk: false },
		Walk: {
			atRouteStart: false,
			middle: false,
			atRouteEnd: false,
		},
		SpawnWarp: {
			portal: true,
			premier: true,
			terminus: true,
			misc: true,
		},
	},
	fast: {
		AirFlight: {
			warpPlane: false,
			helicopter: false,
			seaplane: false,
			unk: false,
		},
		RailLine: { warp: false, cart: false, traincarts: false, unk: false },
		SeaLine: { ferry: false, unk: false },
		BusLine: { unk: false },
		Walk: {
			atRouteStart: false,
			middle: false,
			atRouteEnd: false,
		},
		SpawnWarp: {
			portal: true,
			premier: true,
			terminus: true,
			misc: true,
		},
	},
	classic: {
		AirFlight: {
			warpPlane: true,
			helicopter: true,
			seaplane: true,
			unk: true,
		},
		RailLine: { warp: false, cart: false, traincarts: false, unk: false },
		SeaLine: { ferry: false, unk: false },
		BusLine: { unk: false },
		Walk: {
			atRouteStart: true,
			middle: true,
			atRouteEnd: true,
		},
		SpawnWarp: {
			portal: true,
			premier: true,
			terminus: true,
			misc: true,
		},
	},
} as const satisfies Record<string, ExcludedRoutes>
