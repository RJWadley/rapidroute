import type { DataType } from "app/data"

const getCompany = async (id: string, data: DataType) => {
	const { companies } = await data
	const company = companies.map.get(id)
	return company
		? {
				type: company.type,
				name: company.name,
			}
		: undefined
}

/**
 * list of places used for client side searching - only includes data we want to search through or display
 */
export const getCompressedPlaces = (data: DataType) =>
	data.places.list
		.filter((x) => x.type !== "SpawnWarp")
		.map((place) => ({
			id: place.pretty_id,
			name:
				place.name ||
				(place.type === "RailStation"
					? `${place.pretty_id} Station`
					: `Untitled ${place.type}`),
			codes:
				"code" in place && place.code
					? [place.code]
					: "codes" in place && place.codes
						? place.codes
						: undefined,
			world: place.world,
			company: "company" in place ? getCompany(place.company, data) : undefined,
			type: place.type,
			rank: "rank" in place ? place.rank : undefined,
			mayor: "mayor" in place ? place.mayor : undefined,
			deputy_mayor: "deputy_mayor" in place ? place.deputy_mayor : undefined,
			coordinates: place.coordinates,
		}))

export type CompressedPlace = ReturnType<typeof getCompressedPlaces>[number]
