import type { DataType, Place } from "app/data"

// Keep optional properties readable as undefined, without SuperJSON metadata.
type DefinedFields<T> = {
	[K in keyof T as undefined extends T[K] ? never : K]: T[K]
} & {
	[K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
		T[K],
		undefined
	>
}
const omitUndefined = <T extends object>(value: T): DefinedFields<T> =>
	Object.fromEntries(
		Object.entries(value).filter(([, value]) => value !== undefined),
	) as DefinedFields<T>

const getCompany = (id: string, data: DataType) => {
	const { companies } = data
	const company = companies.map.get(id)
	return company
		? omitUndefined({
				type: company.type,
				name: company.name,
			})
		: undefined
}

const getCodeColors = (place: Place, data: DataType) => {
	if (place.type !== "RailStation" && place.type !== "SeaStop") return undefined

	const lineIds = new Set(
		Object.values(place.connections)
			.flat()
			.map(({ line }) => line),
	)
	const lines = [...lineIds]
		.flatMap((id) => {
			const line = data.connectionLines.map.get(id)
			const lineType = place.type === "RailStation" ? "RailLine" : "SeaLine"
			return line?.type === lineType && line.color
				? [{ code: line.code, color: line.color }]
				: []
		})
		.sort((a, b) => b.code.length - a.code.length)
	const colors = Object.fromEntries(
		place.codes.flatMap((code) => {
			const line =
				lines.find((line) =>
					code.toLowerCase().startsWith(line.code.toLowerCase()),
				) ??
				(lineIds.size === 1 && place.codes.length === 1 ? lines[0] : undefined)
			return line ? [[code, line.color] as const] : []
		}),
	)
	return Object.keys(colors).length ? colors : undefined
}

/**
 * list of places used for client side searching - only includes data we want to search through or display
 */
export const getCompressedPlaces = (data: DataType) =>
	data.places.list
		.filter((x) => x.type !== "SpawnWarp")
		.map((place) => {
			const codes = (
				"code" in place && place.code
					? [place.code]
					: "codes" in place
						? place.codes
						: undefined
			)?.filter((code) => code.trim())
			const fallbackName =
				codes?.join(", ") ||
				(place.coordinates
					? `X ${Math.round(place.coordinates[0])}, Z ${Math.round(place.coordinates[1])}`
					: {
							Town: "Unnamed city",
							RailStation: "Unnamed rail station",
							BusStop: "Unnamed bus stop",
							SeaStop: "Unnamed ferry stop",
							AirAirport: "Unnamed airport",
						}[place.type])
			return omitUndefined({
				id: place.pretty_id,
				name: place.name || fallbackName,
				nameIsCode: !place.name && codes?.length ? true : undefined,
				codes,
				modes: place.type === "AirAirport" ? place.modes : undefined,
				world: place.world,
				company:
					"company" in place ? getCompany(place.company, data) : undefined,
				type: place.type,
				rank: "rank" in place ? place.rank : undefined,
				mayor: "mayor" in place ? place.mayor : undefined,
				deputy_mayor: "deputy_mayor" in place ? place.deputy_mayor : undefined,
				coordinates: place.coordinates,
				codeColors: getCodeColors(place, data),
			})
		})

export type CompressedPlace = ReturnType<typeof getCompressedPlaces>[number]
