"use client"

import { styled } from "@linaria/react"
import RouteOptions from "./components/RouteOptions"
import { SearchBox } from "./components/SearchBox"
import SelectedRoute from "./components/SelectedRoute"
import { LayoutGroup, motion, MotionConfig } from "motion/react"
import type { CompressedPlace } from "./utils/compressedPlaces"

import "./global.css"
import { useSearchParamState } from "./utils/useSearchParamState"

export default function AppGrid({ places }: { places: CompressedPlace[] }) {
	const [isometric, setIsometric] = useSearchParamState("isometric")

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
					</Column>
				</Columns>
			</LayoutGroup>
		</MotionConfig>
	)
}

const Columns = styled(motion.div)`
    width: 100dvw;
    position: relative;
    z-index: 2;
    height: 100dvh;
    overflow: clip;
    pointer-events: none;
    display: grid;
    grid-template-columns: 400px 400px 1fr;
`

const Column = styled(motion.div)`
	overflow: clip auto;

	/* hide scrollbar */
	&::-webkit-scrollbar {
		display: none;
	}

	/* firefox */
	scrollbar-width: none;

    & > * {
        pointer-events: auto;
    }
`
