"use client"

import { styled } from "@linaria/react"
import { useClickAway } from "ahooks"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { findClosestPlace } from "app/utils/search"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { type ReactNode, useRef, useState } from "react"
import { useCamera } from "../MapMovement"
import { getTextboxName } from "./getTextboxName"
import useSearchBox from "./useSearchBox"

export function SearchBox({
	places,
	children,
}: {
	places: CompressedPlace[]
	children?: ReactNode
}) {
	const wrapper = useRef<HTMLDivElement>(null)
	const navigateRef = useRef<HTMLButtonElement>(null)
	const fromFieldRef = useRef<HTMLTextAreaElement>(null)
	const { moveCamera } = useCamera()

	const [from, setFrom] = useSearchParamState("from")
	const [to, setTo] = useSearchParamState("to")
	const [navMode, setNavMode] = useState(Boolean(from))

	const fromPlace = findClosestPlace(from, places)
	const toPlace = findClosestPlace(to, places)

	if (to && !toPlace) setTo(findClosestPlace(to, places)?.id)

	const {
		inputProps: fromProps,
		onFocusLost: fromFocusLost,
		searchResults: fromResults,
		clear: clearFrom,
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
		clear: clearTo,
	} = useSearchBox({
		initialPlaces: places,
		initiallySelectedPlace: toPlace,
		onItemSelected: (item, explicitly) => {
			setTo(item?.id)

			if (item?.coordinates && explicitly)
				moveCamera({
					x: item.coordinates[0] - 150,
					z: item.coordinates[1],
					worldScreenWidth: 1500,
				})
		},
		onBlur: () => {
			setTimeout(() => {
				navigateRef.current?.focus()
				fromFieldRef.current?.focus()
			})
		},
	})

	useClickAway(fromFocusLost, wrapper)
	useClickAway(toFocusLost, wrapper)

	const hasRoutes = Boolean(from)
	const hasSearch = Boolean(fromResults?.[0] || toResults?.[0])

	return (
		<>
			<Wrapper ref={wrapper}>
				{navMode ? (
					<>
						<textarea
							{...fromProps}
							onFocus={(e) => {
								toFocusLost()
								fromProps.onFocus(e)
							}}
							placeholder="From"
							ref={fromFieldRef}
						/>
						<button
							type="button"
							onClick={() => {
								clearFrom()
								setNavMode(false)
							}}
						>
							Clear
						</button>
					</>
				) : to ? (
					<button
						type="button"
						onClick={() => {
							setNavMode(true)
							setTimeout(() => {
								fromFieldRef.current?.focus()
							})
						}}
						ref={navigateRef}
					>
						Navigate
					</button>
				) : null}
				<br />
				<textarea
					{...toProps}
					onFocus={(e) => {
						fromFocusLost()
						toProps.onFocus(e)
					}}
					placeholder="to"
				/>
				<button type="button" onClick={clearTo}>
					Clear
				</button>
				{(fromResults ?? toResults)?.map((result) => (
					<button type="button" onClick={result.selectItem} key={result.id}>
						{getTextboxName(result)} {result.highlighted ? "🔍" : ""}
					</button>
				))}
				{hasRoutes || hasSearch ? null : children}
			</Wrapper>
		</>
	)
}

const Wrapper = styled.div`
background: whitesmoke;
`
