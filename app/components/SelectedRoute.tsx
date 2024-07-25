"use client"

import { styled } from "@linaria/react"
import type { Place } from "app/data"
import { useRouting } from "./RoutingContext"

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

export default function SelectedRoute() {
	const { routes, preferredRoute, isLoading } = useRouting()

	const index = preferredRoute ?? 0

	const result = routes?.[index]

	if (!result) return null

	return (
		<Wrapper>
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
					from {getPlaceDisplay(leg.from)} to {getPlaceDisplay(leg.to)} via{" "}
					<br />
					{leg.options
						.map(
							(option) =>
								`option: ${option.type} ${"code" in option ? option.code : ""} with ${
									option.airline?.name ??
									option.company?.name ??
									(option.type === "walk" ? "your legs" : "unknown company")
								}`,
						)
						.join(", ")}
					{leg.skipped ? ` (skips ${leg.skipped.length})` : null}
				</div>
			))}
		</Wrapper>
	)
}

const Wrapper = styled.div`
    background: white;
`