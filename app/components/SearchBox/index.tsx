"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useClickAway } from "ahooks"
import { Add } from "app/icons/add"
import { Close } from "app/icons/close"
import { Pin } from "app/icons/pin"
import { Point } from "app/icons/point"
import { Search } from "app/icons/search"
import { Start } from "app/icons/start"
import { useRouting } from "app/providers/RoutingContext"
import type { CompressedPlace } from "app/utils/compressedPlaces"
import {
	parseOfflinePlayers,
	useOfflinePlayers,
} from "app/utils/offlinePlayers"
import { useOnlinePlayers } from "app/utils/onlinePlayers"
import { findClosestPlace } from "app/utils/search"
import { theme } from "app/utils/theme"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState } from "react"
import { styled } from "restyle"
import Box from "../Box"
import { TextArea } from "../TextArea"
import WikiArticle from "../Wiki/WikiArticle"
import SearchResult from "./SearchResult"
import useSearchBox from "./useSearchBox"

export function SearchBox() {
	const wrapper = useRef<HTMLDivElement>(null)
	const navigateRef = useRef<HTMLButtonElement>(null)
	const fromFieldRef = useRef<HTMLTextAreaElement>(null)
	// const { moveCamera } = useCamera()

	const { fromID, setFromID, toID, setToID } = useRouting()
	const [navMode, setNavMode] = useState(Boolean(fromID))
	const { data: players } = useOnlinePlayers()
	const { data: offlinePlayers } = useOfflinePlayers()
	const { data: compressedPlaces } = useSuspenseQuery<CompressedPlace[]>({
		queryKey: ["compressed-places"],
	})

	const parsedOfflinePlayers = parseOfflinePlayers(offlinePlayers)

	const fromPlace =
		players?.[fromID ?? ""] ??
		parsedOfflinePlayers?.[fromID ?? ""] ??
		findClosestPlace(fromID, compressedPlaces)
	const toPlace =
		players?.[toID ?? ""] ??
		parsedOfflinePlayers?.[toID ?? ""] ??
		findClosestPlace(toID, compressedPlaces)

	const {
		inputProps: fromProps,
		onFocusLost: fromFocusLost,
		searchResults: fromResults,
		clear: clearFrom,
	} = useSearchBox({
		places: compressedPlaces,
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
		places: compressedPlaces,
		initiallySelectedPlace: toPlace,
		onItemSelected: (item, explicitly) => {
			setToID(item?.id)

			// TODO
			// if (item?.coordinates && explicitly)
			// 	moveCamera({
			// 		x: item.coordinates[0] - 150,
			// 		z: item.coordinates[1],
			// 		worldScreenWidth: 1500,
			// 	})
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
		autoFocus: true,
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
					{!navMode && toID ? (
						<NavigateTrigger
							id="navigateButton"
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
							<AddIcon />
							Choose a starting point
						</NavigateTrigger>
					) : null}
				</AnimatePresence>
				<SearchWrap layout style={{ borderRadius: 28 }}>
					<AnimatePresence mode="popLayout" initial={false}>
						{navMode && (
							<SearchBar {...layout} layout>
								<motion.div layout="position">
									<PointIcon />
								</motion.div>
								<motion.div layout="position">
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
								<CloseButton
									layout="position"
									type="button"
									onClick={() => {
										clearFrom()
										setNavMode(false)
									}}
									title="Reset Starting Point"
									invisible={false}
								>
									<CloseIcon />
								</CloseButton>
							</SearchBar>
						)}
					</AnimatePresence>
					<SearchBar layout>
						<motion.div layout="position">
							<SearchIcon
								style={{ position: "absolute" }}
								animate={{ opacity: navMode ? 0 : 1 }}
							/>
							<PinIcon animate={{ opacity: navMode ? 1 : 0 }} />
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
						<CloseButton
							layout="position"
							type="button"
							onClick={clearTo}
							title="Reset"
							invisible={!toProps.value}
						>
							<CloseIcon />
						</CloseButton>
					</SearchBar>
				</SearchWrap>
				<AnimatePresence mode="popLayout">
					{hasSearchResults && (
						<Results {...layout} key={hasFromResults ? "from" : "to"}>
							{(fromResults ?? toResults)?.map((result) => (
								<SearchResult key={result.id} place={result} />
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

const SearchIcon = styled(Search, {
	width: "24px",
	height: "24px",
})

const AddIcon = styled(Add, {
	width: "24px",
	height: "24px",
})

const StartIcon = styled(Start, {
	width: "24px",
	height: "24px",
})

const PointIcon = styled(Point, {
	width: "24px",
	height: "24px",
})

const PinIcon = styled(Pin, {
	width: "24px",
	height: "24px",
})

const CloseButton = styled(
	motion.button,
	({ invisible }: { invisible: boolean }) => ({
		border: "unset",
		padding: 10,
		margin: -10,
		borderRadius: 99,
		opacity: invisible ? 0 : 1,
		transition: "opacity 0.2s, background 0.2s",
		pointerEvents: invisible ? "none" : "auto",
		background: "transparent",

		"&:hover": {
			background: theme.cardHover,
		},

		"&:active": {
			background: theme.cardActive,
		},
	}),
)

const CloseIcon = styled(Close, {
	width: "24px",
	height: "24px",
})

const SearchWrap = styled(motion.div, {
	background: theme.cardProminent,
	boxShadow: theme.cardBoxShadow,
	position: "relative",
	overflow: "clip",
})

const Results = styled(motion.div, {
	padding: 16,
	display: "grid",
	gap: 16,
})

const SearchBar = styled(motion.label, {
	padding: "16px",
	display: "grid",
	gridTemplateColumns: "auto 1fr auto",
	placeItems: "center start",
	gap: "16px",
	borderRadius: 28,
	transition: "background 0.2s",
})

const NavigateTrigger = styled(motion.button, {
	width: "100%",
	textAlign: "left",
	padding: `${16 - 5}px`,
	display: "grid",
	gap: "16px",
	gridTemplateColumns: "auto 1fr auto",
	background: "transparent",
	borderRadius: 28,
	border: `5px solid ${theme.cardBackground}`,
	transition: "background 0.2s",

	"&:hover": {
		background: theme.cardHover,
	},

	"&:active": {
		background: theme.cardActive,
	},
})
