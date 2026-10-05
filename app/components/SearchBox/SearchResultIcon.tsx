import type { CompressedPlace } from "app/utils/compressedPlaces"

type ResultType = CompressedPlace["type"] | "Coordinate" | "Player"

export const resultTypes: Record<
	ResultType,
	{ color?: string; label: string; path: string }
> = {
	Town: {
		label: "City",
		path: "M3 21h18M5 21V9h6v12M11 21V3h8v18M7 12h2m-2 4h2m4-10h4m-4 4h4m-4 4h4m-4 4h4",
	},
	BusStop: {
		color: "#D97F06",
		label: "Bus stop",
		path: "M7 3h10a2 2 0 0 1 2 2v13H5V5a2 2 0 0 1 2-2ZM5 11h14M8 15h.01M16 15h.01M7 18v3m10-3v3M9 6h6",
	},
	RailStation: {
		color: "#C8303F",
		label: "Rail station",
		path: "M8 3h8a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM5 10h14M12 3v7M8 14h.01M16 14h.01M8 18l-3 3m11-3 3 3M7 20h10",
	},
	AirAirport: {
		color: "#7E57C2",
		label: "Airport",
		path: "m21 15-8-5V4a1 1 0 0 0-2 0v6l-8 5v2l8-3v5l-3 2v1l4-1 4 1v-1l-3-2v-5l8 3Z",
	},
	SeaStop: {
		color: "#0E9AA7",
		label: "Ferry stop",
		path: "M6 12V6h12v6M12 3v3M3 13l9-3 9 3-3 6H6ZM12 10v7M3 21q3-2 6 0t6 0t6 0",
	},
	Coordinate: {
		label: "Coordinates",
		path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 1v4m0 14v4M1 12h4m14 0h4",
	},
	Player: {
		label: "Player",
		path: "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 21v-3a7 7 0 0 1 14 0v3",
	},
}

export default function SearchResultIcon({ type }: { type: ResultType }) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d={resultTypes[type].path} />
		</svg>
	)
}
