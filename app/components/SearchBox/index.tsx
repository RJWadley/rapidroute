"use client"

import { useClickAway } from "ahooks"
import { useOnlinePlayers } from "app/utils/onlinePlayers"
import { findClosestPlace } from "app/utils/search"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState } from "react"
import { IoSearch } from "react-icons/io5"
import { styled } from "restyle"
import Box from "../Box"
import { useCamera } from "../MapMovement"
import { TextArea } from "../TextArea"
import WikiArticle from "../Wiki/WikiArticle"
import { getTextboxName } from "./getTextboxName"
import useSearchBox from "./useSearchBox"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import { useRouting } from "app/providers/RoutingContext"

export function SearchBox() {
	const wrapper = useRef<HTMLDivElement>(null)
	const navigateRef = useRef<HTMLButtonElement>(null)
	const fromFieldRef = useRef<HTMLTextAreaElement>(null)
	const { moveCamera } = useCamera()

	const { fromID, setFromID, toID, setToID } = useRouting()
	const [navMode, setNavMode] = useState(Boolean(fromID))
	const { data: players } = useOnlinePlayers()
	const { data: compressedPlaces } = useSuspenseQuery<CompressedPlace[]>({
		queryKey: ["compressed-places"],
	})

	const fromPlace =
		players?.[fromID ?? ""] ?? findClosestPlace(fromID, compressedPlaces)
	const toPlace =
		players?.[toID ?? ""] ?? findClosestPlace(toID, compressedPlaces)

	const {
		inputProps: fromProps,
		onFocusLost: fromFocusLost,
		searchResults: fromResults,
		clear: clearFrom,
	} = useSearchBox({
		initialPlaces: compressedPlaces,
		initiallySelectedPlace: fromPlace,
		onItemSelected: (item) => {
			setFromID(item?.id)
		},
	})
	const {
		inputProps: toProps,
		onFocusLost: toFocusLost,
		searchResults: toResults,
		clear: clearTo,
	} = useSearchBox({
		initialPlaces: compressedPlaces,
		initiallySelectedPlace: toPlace,
		onItemSelected: (item, explicitly) => {
			setToID(item?.id)

			if (item?.coordinates && explicitly)
				moveCamera({
					x: item.coordinates[0] - 150,
					z: item.coordinates[1],
					worldScreenWidth: 1500,
				})
		},
		onBlur: () => {
			setTimeout(() => {
				// TODO react 19 fix broken ref
				navigateRef.current?.focus()
				document
					.querySelector<HTMLButtonElement>("button#navigateButton")
					?.focus()
			})
		},
	})

	useClickAway(fromFocusLost, wrapper)
	useClickAway(toFocusLost, wrapper)

	const hasRoutes = Boolean(fromID)
	const hasFromResults = Boolean(fromResults?.[0])
	const hasSearchResults = Boolean(fromResults?.[0] || toResults?.[0])
	const allIsBlank = !fromID && !toID && !hasSearchResults

	const allowChildren = !hasRoutes && !hasSearchResults && !allIsBlank

	const layout = {
		layout: "position",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	} as const

	return (
		<Box>
			<div ref={wrapper}>
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
					) : toID ? (
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
							autoFocus
						/>
					</motion.div>
					<motion.button layout="position" type="button" onClick={clearTo}>
						Clear
					</motion.button>
				</PrimarySearch>

				<AnimatePresence mode="popLayout">
					{hasSearchResults && (
						<Results {...layout} key={hasFromResults ? "from" : "to"}>
							{(fromResults ?? toResults)?.map((result) => (
								<Result
									type="button"
									onClick={result.selectItem}
									key={result.id}
									ref={
										result.highlighted
											? (el) => {
													const bounds = el?.getBoundingClientRect()
													if (!bounds) return

													const isInView =
														bounds.top >= 0 &&
														bounds.bottom <=
															(window.innerHeight ||
																document.documentElement.clientHeight)
													if (isInView) return

													el?.scrollIntoView({
														behavior: "smooth",
														block: "nearest",
													})
												}
											: null
									}
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
							<WikiArticle />
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		</Box>
	)
}

const SearchIcon = styled(IoSearch, {
	width: "24px",
	height: "24px",
	border: "1px solid blue",
})

const PrimarySearch = styled(motion.label, {
	border: "1px solid blue",
	padding: "16px",
	display: "grid",
	gridTemplateColumns: "auto 1fr auto",
	placeItems: "center start",
})

const Results = styled(motion.div, {
	border: "1px solid orange",
})

const Result = styled("button", {
	display: "block",
	scrollMargin: "200px",
})

const SecondarySearch = styled(motion.label, {
	border: "1px solid purple",
	padding: "16px",
	display: "grid",
	gridTemplateColumns: "1fr auto",
	placeItems: "center start",
})

const NavigateTrigger = styled(motion.button, {
	border: "1px solid red",
})
