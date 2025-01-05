"use client"

import { LayoutGroup, MotionConfig, motion } from "motion/react"
import { styled } from "restyle"
import RouteOptions from "./components/RouteOptions"
import { SearchBox } from "./components/SearchBox"
import SelectedRoute from "./components/SelectedRoute"
import type { CompressedPlace } from "./utils/compressedPlaces"

import "./global.css"
import { useSearchParamState } from "./utils/useSearchParamState"
import { useLocalDark } from "./utils/locals"

export default function AppGrid({ places }: { places: CompressedPlace[] }) {
	const [isometric, setIsometric] = useSearchParamState("isometric")
	const [{ preference }, setDarkPreference] = useLocalDark()

	return (
		<MotionConfig reducedMotion="user">
			<LayoutGroup>
				<Columns>
					<Column layout>
						<SearchBox places={places} />
						<RouteOptions />
					</Column>
					<Column>
						<SelectedRoute />
						<button
							type="button"
							onClick={() => setIsometric(isometric ? undefined : "true")}
						>
							toggle isometric
						</button>
						<button
							type="button"
							onClick={() => {
								// dark -> light -> system
								if (preference === "dark") setDarkPreference("light")
								else if (preference === "light") setDarkPreference("system")
								else setDarkPreference("dark")
							}}
						>
							toggle dark
						</button>
					</Column>
				</Columns>
			</LayoutGroup>
		</MotionConfig>
	)
}

const Columns = styled(motion.div, {
	width: "100dvw",
	position: "relative",
	zIndex: 2,
	height: "100dvh",
	overflow: "clip",
	pointerEvents: "none",
	display: "grid",
	gridTemplateColumns: "400px 400px 1fr",
})

const Column = styled(motion.div, {
	overflow: "clip auto",

	/* hide scrollbar */
	"&::-webkit-scrollbar": {
		display: "none",
	},

	/* firefox */
	scrollbarWidth: "none",

	"& > *": {
		pointerEvents: "auto",
	},
})
