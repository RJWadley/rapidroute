"use client"

import { useMemo, useState } from "react"
import { findPath } from "./pathing"
import { places, type Place } from "./data"

const getPlaceDisplay = (place: Place) => {
	const code = "code" in place ? place.code : null
	const name = place.name || "Unnamed"
	return code ? `${place.type} ${code} - ${name}` : `${place.type} ${name}`
}

export default function Home() {
	const [startId, setStartId] = useState<string>()
	const [finishId, setFinishId] = useState<string>()

	const results = useMemo(
		() => (startId && finishId ? findPath(startId, finishId) : null),
		[startId, finishId],
	)

	const sortedPlaces = places.list.sort((a, b) =>
		getPlaceDisplay(a).localeCompare(getPlaceDisplay(b)),
	)

	const options = sortedPlaces.map((item) => (
		<option key={item.id} value={item.id}>
			{getPlaceDisplay(item)}
		</option>
	))

	return (
		<div>
			<p>starting location</p>
			<select onChange={(e) => setStartId(e.currentTarget.value)}>
				<option value="">Select a starting location</option>
				{options}
			</select>
			<p>ending location</p>
			<select onChange={(e) => setFinishId(e.currentTarget.value)}>
				<option value="">Select an ending location</option>
				{options}
			</select>
			<br />
			{results && results?.length > 0
				? results.map((result, index) => (
						<div key={result.id}>
							<br />
							result number {index + 1} ({Math.round(result.time)} seconds):
							<br />
							{/* {result.path
								.map((place) => `${place.type} ${place.name}`)
								.flatMap((place, index) => (
									<div key={place}>
										{place} {index === result.path.length - 1 ? null : "->"}
										<br />
									</div>
								))} */}
							{result.path.map((leg) => (
								<div key={leg.id}>
									from {leg.from.name} to {leg.to.name} via <br />
									{leg.options
										.map(
											(option) =>
												`${option.type} with ${
													option.airline?.name ??
													option.company?.name ??
													(option.type === "walk"
														? "your legs"
														: "unknown company")
												}`,
										)
										.join(", ")}
								</div>
							))}
						</div>
					))
				: "no results"}
		</div>
	)
}
