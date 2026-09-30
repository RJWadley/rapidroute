"use client"

import Box from "app/components/Box"
import RouteOptions from "app/components/RouteOptions"
import { SearchBox } from "app/components/SearchBox"
import SelectedRoute from "app/components/SelectedRoute"
import { useLocalDark, useLocalIsometric } from "app/utils/locals"
import { LayoutGroup, motion } from "motion/react"
import { styled } from "restyle"

export default function AppGrid({ children }: { children: React.ReactNode }) {
	const [{ preference, isDark }, setDarkPreference] = useLocalDark()
	const [isometric, setIsometric] = useLocalIsometric()

	return (
		<>
			<LayoutGroup>
				<Columns>
					<Column layout>
						<SearchBox />
						<RouteOptions />
					</Column>
					<Column>
						<SelectedRoute />
					</Column>
				</Columns>
			</LayoutGroup>
		</>
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
	"@media (max-width: 800px)": {
		gridTemplateColumns: "minmax(0, 400px) minmax(0, 400px)",
	},
	"@media (max-width: 600px)": {
		display: "block",
		overflow: "clip auto",
		"& > div": { overflow: "visible" },
	},
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
