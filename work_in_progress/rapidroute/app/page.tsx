"use client"

import { useState } from "react"
import { findPath } from "./pathing"
import { places } from "./data"

export default function Home() {
	const [startId, setStartId] = useState<string>()
	const [finishId, setFinishId] = useState<string>()

	if (startId && finishId) findPath(startId, finishId)

	return (
		<div>
			<p>starting location</p>
			<select onChange={(e) => setStartId(e.currentTarget.value)}>
				<option value="">Select a starting location</option>
				{places.list.map((item) => (
					<option key={item.id} value={item.id}>
						{item.name || "Unnamed"}
					</option>
				))}
			</select>
			<p>ending location</p>
			<select onChange={(e) => setFinishId(e.currentTarget.value)}>
				<option value="">Select an ending location</option>
				{places.list.map((item) => (
					<option key={item.id} value={item.id}>
						{item.name || "Unnamed"}
					</option>
				))}
			</select>
		</div>
	)
}
