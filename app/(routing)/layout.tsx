"use client"

import { LayoutGroup, motion } from "motion/react"
import { styled } from "restyle"
import { SearchBox } from "app/components/SearchBox"
import RouteOptions from "app/components/RouteOptions"
import SelectedRoute from "app/components/SelectedRoute"

export default function AppGrid() {
	return (
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
