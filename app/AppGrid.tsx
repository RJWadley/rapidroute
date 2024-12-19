"use client"

import { styled } from "@linaria/react"
import RouteOptions from "./components/RouteOptions"
import { SearchBox } from "./components/SearchBox"
import SelectedRoute from "./components/SelectedRoute"
import { compressedPlaces } from "./utils/compressedPlaces"
import { LayoutGroup, motion } from "motion/react"

import "./global.css"

export default function AppGrid() {
	return (
		<LayoutGroup>
			<GridWrapper layout>
				<Box layout>
					<motion.div layout="position">pre</motion.div>
					<SearchBox places={compressedPlaces}>
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						child content
						<br />
						{/* <br />
					<WikiArticle places={compressedPlaces} /> */}
					</SearchBox>
					<motion.div layout="position">post</motion.div>
				</Box>
				<Box layout>
					<RouteOptions />
					route options
				</Box>
				<Box layout>
					<SelectedRoute />
					selected route
				</Box>
			</GridWrapper>
		</LayoutGroup>
	)
}

const GridWrapper = styled(motion.div)`
    width: 100vw;
    position: relative;
    z-index: 2;
    height: 100dvh;
    overflow: auto;
    pointer-events: none;
    display:grid;
    grid-template-columns: 400px 1fr;
    grid-template-rows: auto 1fr;

    & > * {
        pointer-events: auto;
    }
`

const Box = styled(motion.div)`
    border: 1px solid green;
`
