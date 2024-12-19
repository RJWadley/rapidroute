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
import { AnimatePresence, motion } from "motion/react"

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
	const hasSearchResults = Boolean(fromResults?.[0] || toResults?.[0])
	const allIsBlank = !from && !to && !hasSearchResults

	const allowChildren = !hasRoutes && !hasSearchResults && !allIsBlank

	const layout = {
		layout: "position",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	} as const

	return (
		<>
			<Wrapper ref={wrapper} layout>
				<AnimatePresence mode="popLayout" initial={false}>
					{navMode ? (
						<SecondarySearch {...layout} key="secondary">
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
						</SecondarySearch>
					) : to ? (
						<NavigateTrigger
							key="navigate"
							type="button"
							onClick={() => {
								setNavMode(true)
								setTimeout(() => {
									fromFieldRef.current?.focus()
								})
							}}
							ref={navigateRef}
							{...layout}
						>
							Navigate
						</NavigateTrigger>
					) : null}
				</AnimatePresence>
				<PrimarySearch layout="position">
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
				</PrimarySearch>

				<AnimatePresence mode="popLayout">
					{hasSearchResults && (
						<Results {...layout}>
							{(fromResults ?? toResults)?.map((result) => (
								<Result
									type="button"
									onClick={result.selectItem}
									key={result.id}
								>
									{getTextboxName(result)} {result.highlighted ? "🔍" : ""}
								</Result>
							))}
						</Results>
					)}
				</AnimatePresence>
				<AnimatePresence mode="popLayout" initial={false}>
					{allowChildren ? (
						<motion.div {...layout}>{children}</motion.div>
					) : null}
				</AnimatePresence>
			</Wrapper>
		</>
	)
}

const Wrapper = styled(motion.div)`
	background: whitesmoke;
	overflow: clip;
	position:relative;
`

const PrimarySearch = styled(motion.div)`border:1px solid blue;`

const Results = styled(motion.div)`
	border: 1px solid orange;
	`

const Result = styled.button`display:block;`

const SecondarySearch = styled(motion.div)`
	border: 1px solid purple;
`

const NavigateTrigger = styled(motion.button)`
	border: 1px solid red;
`
