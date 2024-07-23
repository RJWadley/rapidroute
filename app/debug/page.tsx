"use client"

import { findPathInServer } from "@/pathing/server-front"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { type Place, places } from "../data"
import { findPathInWorker } from "../pathing/worker-front"

const method: "worker" | "server" = "worker"

const getPlaceDisplay = (place: Place) => {
	const code =
		"code" in place
			? place.code
			: "codes" in place
				? place.codes.join(", ")
				: null
	const name = place.name || "Unnamed"
	return code ? `${code} - ${name} ${place.type}` : `${place.type} ${name}`
}

export default function Home() {
	const [startId, setStartId] = useState<string>()
	const [finishId, setFinishId] = useState<string>()

	const { isLoading, data: results } = useQuery({
		queryKey: ["route", startId, finishId],
		queryFn: () =>
			method === "worker"
				? findPathInWorker(startId, finishId)
				: findPathInServer(startId, finishId),
	})

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
			{isLoading
				? "loading..."
				: results && results?.length > 0
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
										from {getPlaceDisplay(leg.from)} to{" "}
										{getPlaceDisplay(leg.to)} via <br />
										{leg.options
											.map(
												(option) =>
													`option: ${option.type} ${"code" in option ? option.code : ""} with ${
														option.airline?.name ??
														option.company?.name ??
														(option.type === "walk"
															? "your legs"
															: "unknown company")
													}`,
											)
											.join(", ")}
										{leg.skipped ? ` (skips ${leg.skipped.length})` : null}
									</div>
								))}
							</div>
						))
					: "no results"}
		</div>
	)
}
