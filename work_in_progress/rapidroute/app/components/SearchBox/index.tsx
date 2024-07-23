"use client"

import type { CompressedPlace } from "@/utils/compressedPlaces"
import { findClosestPlace } from "@/utils/search"
import { useSearchParamState } from "@/utils/useSearchParamState"
import { useClickAway } from "ahooks"
import { useRef } from "react"
import useSearchBox from "./useSearchBox"
import WikiData from "../WikiData"

export function SearchBox({ places }: { places: CompressedPlace[] }) {
	const wrapper = useRef<HTMLDivElement>(null)

	const [from, setFrom] = useSearchParamState("from")
	const [to, setTo] = useSearchParamState("to")

	const fromPlace = findClosestPlace(from, places)
	const toPlace = findClosestPlace(to, places)

	if (to && !toPlace) setTo(findClosestPlace(to, places)?.id)

	const {
		inputProps: fromProps,
		onFocusLost: fromFocusLost,
		searchResults: fromResults,
	} = useSearchBox({
		initialPlaces: places,
		initiallySelectedPlace: fromPlace,
		onItemSelected: (item) => {
			setFrom(item?.id)
		},
	})
	const {
		inputProps: toProps,
		onFocusLost: toFocusLost,
		searchResults: toResults,
	} = useSearchBox({
		initialPlaces: places,
		initiallySelectedPlace: toPlace,
		onItemSelected: (item) => {
			setTo(item?.id)
		},
	})

	useClickAway(fromFocusLost, wrapper)
	useClickAway(toFocusLost, wrapper)

	return (
		<>
			<div ref={wrapper}>
				<textarea
					{...fromProps}
					onFocus={(e) => {
						toFocusLost()
						fromProps.onFocus(e)
					}}
				/>
				<textarea
					{...toProps}
					onFocus={(e) => {
						fromFocusLost()
						toProps.onFocus(e)
					}}
				/>
				{(fromResults ?? toResults)?.map((result) => (
					<button type="button" onClick={result.selectItem} key={result.id}>
						{result.codes?.join(", ")} {result.name}{" "}
						{result.highlighted ? "🔍" : ""}
					</button>
				))}
				<WikiData />
			</div>
		</>
	)
}
