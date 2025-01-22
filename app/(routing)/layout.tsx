"use client"

import { LayoutGroup, motion } from "motion/react"
import { styled } from "restyle"
import { SearchBox } from "app/components/SearchBox"
import RouteOptions from "app/components/RouteOptions"
import SelectedRoute from "app/components/SelectedRoute"
import { useLocalDark, useLocalIsometric } from "app/utils/locals"

export default function AppGrid() {
	const [{ preference, isDark }, setDarkPreference] = useLocalDark()
	const [isometric, setIsometric] = useLocalIsometric()

	return (
		<LayoutGroup>
			<Columns>
				<Column layout>
					<SearchBox />
					<RouteOptions />
				</Column>
				<Column>
					<SelectedRoute />
					<button
						type="button"
						onClick={() => {
							setIsometric(!isometric)
						}}
					>
						toggle isometric
					</button>
					<br />
					<button
						suppressHydrationWarning
						type="button"
						onClick={() => {
							// dark -> light -> system -> dark
							if (preference === "dark") setDarkPreference("light")
							else if (preference === "light") setDarkPreference("system")
							else setDarkPreference("dark")
						}}
					>
						toggle dark, currently {preference || "initializing"} (
						{isDark ? "dark" : "light"})
					</button>
				</Column>
			</Columns>
		</LayoutGroup>
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
