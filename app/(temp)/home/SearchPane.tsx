"use client"

import SearchBox from "(temp)/components/SearchBox"
import type { Place } from "@prisma/client"

export default function SearchPane({
	initialPlaces,
}: {
	initialPlaces: Place[]
}) {
	return <SearchBox initialPlaces={initialPlaces} />
}
