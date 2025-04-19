export type OnlinePlayer = {
	id: `player-${string}`
	type: "Player"
	isOnline: true
	username: string

	// raw location data
	world: "New" | "Old" | "Space" | "Unknown"
	x: number
	y: number
	z: number

	// routing data
	positionForRouting: `x${number}z${number}`
	// coordinates: [number, number]
	// label: "Current Location"
}

export type OfflinePlayer = {
	id: `player-${string}`
	type: "Player"
	isOnline: false
	username: string
}

export type Player = OnlinePlayer | OfflinePlayer
