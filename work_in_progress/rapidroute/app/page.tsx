"use client"

import { useState } from "react"
import { findPath } from "./pathing"
import { places } from "./data"

export default function Home() {
	const [startId, setStartId] = useState<string>()
	const [finishId, setFinishId] = useState<string>()

	const results = startId && finishId ? findPath(startId, finishId) : null

	const onlyAirports = places.list
		.filter((place) => place.type === "airport")
		.sort((a, b) => a.code.localeCompare(b.code))

	return (
		<div>
			<p>starting location</p>
			<select onChange={(e) => setStartId(e.currentTarget.value)}>
				<option value="">Select a starting location</option>
				{onlyAirports.map((item) => (
					<option key={item.id} value={item.id}>
						{item.code} - {item.name || "Unnamed"}
					</option>
				))}
			</select>
			<p>ending location</p>
			<select onChange={(e) => setFinishId(e.currentTarget.value)}>
				<option value="">Select an ending location</option>
				{onlyAirports.map((item) => (
					<option key={item.id} value={item.id}>
						{item.code} - {item.name || "Unnamed"}
					</option>
				))}
			</select>
			<br />
			{results
				? results.map((result, index) => (
						<div key={result.id}>
							<br />
							result number {index + 1} ({result.time} seconds):
							{result.path.map((leg) => (
								<div key={leg.id}>
									fly from {leg.from.name} to {leg.to.name}
									via{" "}
									{leg.options
										.map(
											(option) =>
												`${option.airline?.name} flight ${option.codes.join(", ")} at gate ${option.gates
													.map((g) => g.code)
													.filter(Boolean)
													.join(", ")}`,
										)
										.join(", ")}
								</div>
							))}
						</div>
					))
				: "waiting for input"}
		</div>
	)
}
