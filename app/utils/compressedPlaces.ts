import { companies, places } from "app/data"

const getCompany = (id: string) => {
	const company = companies.map.get(id)
	return company
		? {
				type: company.type,
				name: company.name,
			}
		: undefined
}

export const compressedPlaces = places.list.map((place) => ({
	id: place.pretty_id,
	name:
		place.name || place.type === "railstation"
			? `${place.pretty_id} Station`
			: `Untitled ${place.type}`,
	codes:
		"code" in place && place.code
			? [place.code]
			: "codes" in place && place.codes
				? place.codes
				: undefined,
	world: place.world,
	company: "company" in place ? getCompany(place.company) : undefined,
	type: place.type,
	rank: "rank" in place ? place.rank : undefined,
	mayor: "mayor" in place ? place.mayor : undefined,
	deputy_mayor: "deputy_mayor" in place ? place.deputy_mayor : undefined,
}))

export type CompressedPlace = (typeof compressedPlaces)[number]
