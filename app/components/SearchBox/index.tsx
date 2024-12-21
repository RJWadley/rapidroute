"use client"

import { styled } from "@linaria/react"
import { useClickAway } from "ahooks"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { findClosestPlace } from "app/utils/search"
import { useSearchParamState } from "app/utils/useSearchParamState"
import { useRef, useState } from "react"
import { useCamera } from "../MapMovement"
import { getTextboxName } from "./getTextboxName"
import useSearchBox from "./useSearchBox"
import { AnimatePresence, motion } from "motion/react"
import { IoSearch } from "react-icons/io5"
import { TextArea } from "../TextArea"
import WikiArticle from "../Wiki/WikiArticle"

export function SearchBox({
	places,
}: {
	places: CompressedPlace[]
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
				// TODO fix broken ref
				navigateRef.current?.focus()
				document
					.querySelector<HTMLButtonElement>("button#navigateButton")
					?.focus()
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
							<motion.div layout="position" key="search">
								<TextArea
									{...fromProps}
									onFocus={(e) => {
										toFocusLost()
										fromProps.onFocus(e)
									}}
									placeholder="From"
									ref={fromFieldRef}
								/>
							</motion.div>
							<motion.button
								key="clear"
								layout="position"
								type="button"
								onClick={() => {
									clearFrom()
									setNavMode(false)
								}}
							>
								Clear
							</motion.button>
						</SecondarySearch>
					) : to ? (
						<NavigateTrigger
							id="navigateButton"
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
				<PrimarySearch layout>
					<motion.div layout="position">
						<SearchIcon />
					</motion.div>
					<motion.div layout="position">
						<TextArea
							{...toProps}
							onFocus={(e) => {
								fromFocusLost()
								toProps.onFocus(e)
							}}
							placeholder="to"
						/>
					</motion.div>
					<motion.button layout="position" type="button" onClick={clearTo}>
						Clear
					</motion.button>
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
						<motion.div {...layout}>
							<WikiArticle places={places} />
						</motion.div>
					) : null}
				</AnimatePresence>
			</Wrapper>
		</>
	)
}

const Wrapper = styled(motion.div)`
position: relative;
`

const SearchIcon = styled(IoSearch)`
	width: 24px;
	height: 24px;
	border: 1px solid blue;
`

const PrimarySearch = styled(motion.label)`
display:block;
border:1px solid blue;
padding: 16px;
display:grid;
grid-template-columns: auto 1fr auto;
place-items: center start;
`

const Results = styled(motion.div)`
	border: 1px solid orange;
	`

const Result = styled.button`display:block;`

const SecondarySearch = styled(motion.label)`
	display:block;
	border:1px solid purple;
	padding: 16px;
	display:grid;
	grid-template-columns: 1fr auto;
	place-items: center start;
`

const NavigateTrigger = styled(motion.button)`
	border: 1px solid red;
`
