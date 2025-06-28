"use client"

import { AnimatePresence, motion } from "motion/react"
import { useRouting, type RouteResult } from "../providers/RoutingContext"
import Box from "./Box"
import TypeModeFilter from "./TypeModeFilter"
import Spinner from "./Spinner"
import { styled } from "restyle"
import { theme } from "app/utils/theme"
import { getShortName } from "app/utils/displayNames"
import { getUnique } from "app/utils/getUnique"
import { Fragment, startTransition } from "react"
import { ChevronRight } from "app/icons/chevronRight"
import { formatTime } from "app/utils/formatTime"
import { capsizeInter } from "app/utils/text"
import { typeToString } from "app/data/typeToString"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

const getMessage = (result: ReturnType<typeof useRouting>) => {
	switch (result.status) {
		case "pending":
			return "Finding a way"
		case "error":
			return "Search failed"
		case "404":
			return "No path found"
		case "success":
			return result.routes.length === 1
				? "1 route found"
				: `${result.routes.length} routes found`
		case "skipped":
			return null
		default:
			result satisfies never
	}
}

const determineDifferences = (options: RouteResult[]) => {
	// get a list of items that are in all results
	const allPlaces = options.flatMap((result) =>
		result.path.flatMap((x) => [x.from, x.to]),
	)

	// for each place, determine how many results include it
	const placesWithCount = allPlaces.map((place) => ({
		place,
		count: options.filter((result) =>
			result.path.some((x) => x.from.i === place.i || x.to.i === place.i),
		).length,
	}))
	const placesByCount = Object.groupBy(placesWithCount, ({ count }) => count)
	const countsByPlace = Object.fromEntries(
		placesWithCount.map(({ place, count }) => [place.i, count]),
	)

	// for each result, determine the 'uniquest' places
	// this would be completely unique places if possible (count === 1)
	// but we can fall back to the 'most unique' places if necessary (count > 1)
	const resultsWithUniquestPlaces = options.map((result) => {
		const resultPlaces = result.path.flatMap((place) => [place.from, place.to])
		const placeCounts = resultPlaces.map((place) => ({
			place,
			count: countsByPlace[place.i] ?? Number.POSITIVE_INFINITY,
		}))
		const lowestCount = Math.min(...placeCounts.map(({ count }) => count))
		const uniquestPlaces = placeCounts
			.filter(({ count }) => count === lowestCount)
			.map(({ place }) => place)

		return { ...result, uniquestPlaces }
	})

	return resultsWithUniquestPlaces
}

export default function RouteOptions() {
	const result = useRouting()
	const message = getMessage(result)

	const diffedResults = result.routes ? determineDifferences(result.routes) : []

	return (
		<Box isVisible={result.status !== "skipped"}>
			<motion.div {...layout} layout="position">
				<TypeModeFilter>
					<Title>
						{message}

						{"took" in result && <Time>{result.took.toFixed(2)}ms</Time>}
					</Title>
				</TypeModeFilter>
			</motion.div>
			<AnimatePresence mode="popLayout" initial={false}>
				{result.status === "pending" && (
					<motion.div {...layout}>
						<Spinner />
					</motion.div>
				)}
				{result.status === "error" && (
					<motion.div {...layout} key="error">
						error!
					</motion.div>
				)}
				{result.status === "404" && (
					<motion.div {...layout} key="404">
						no routes found
					</motion.div>
				)}
				{result.status === "success" && (
					<OptionList
						{...layout}
						key={result.routes.map((x) => x.id).join("-")}
					>
						{diffedResults.map((route, index) => (
							<Option
								type="button"
								key={route.id}
								onClick={() =>
									startTransition(() => result.setPreferredRoute(index))
								}
							>
								<OptionTitle>
									<TitleText>
										{diffedResults.length > 1
											? getUnique(
													route.uniquestPlaces.map((x) => getShortName(x)),
												)
											: "Best Route"}
									</TitleText>
									<TimeChip best={index === 0}>
										{formatTime(route.time)}
									</TimeChip>
								</OptionTitle>
								<StepOverview>
									{route.path.map((step, stepIndex) => (
										<Fragment key={step.id}>
											{stepIndex !== 0 && <ChevronRight />}
											<Step>
												{getUnique(
													step.options.map((o) => typeToString(o.route.type, true)),
												).join(", ")}
											</Step>
										</Fragment>
									))}
									<div style={{ marginLeft: "auto" }} />
								</StepOverview>
							</Option>
						))}
					</OptionList>
				)}
			</AnimatePresence>
		</Box>
	)
}

const OptionList = styled(motion.div, {
	display: "grid",
	padding: "0 16px 16px",
})

const Option = styled("button", {
	borderRadius: 12,
	padding: "4px 4px 8px 8px",
	background: "transparent",
	border: "unset",
	transition: "background 0.2s",
	display: "block",
	width: "100%",
	textAlign: "left",

	"&:hover": {
		background: theme.cardHover,
	},

	"&:active": {
		background: theme.cardActive,
	},
})

const OptionTitle = styled("div", {
	display: "grid",
	gridTemplateColumns: "1fr auto",
	alignItems: "center",
	gap: 8,
})
const TitleText = styled("div", {
	...capsizeInter,
	fontSize: 16,
	wordBreak: "break-word",
	margin: "4px 0",
})
const TimeChip = styled("div", ({ best }: { best?: boolean }) => ({
	background: best ? theme.timeBadge : undefined,
	color: best ? theme.timeBadgeText : undefined,
	...capsizeInter,
	fontSize: 16,
	fontWeight: best ? "bold" : undefined,
	padding: best ? "4px 12px" : "4px",
	borderRadius: best ? 8 : undefined,
	alignSelf: "start",
}))
const StepOverview = styled("div", {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	justifyContent: "space-between",
	marginTop: 8,
	rowGap: 8,
})
const Step = styled("div", {
	...capsizeInter,
	fontSize: 16,
	padding: "8px",
	borderRadius: 8,
	background: `color(from ${theme.cardProminent} srgb r g b / 0.3)`,
})

const Title = styled("div", {
	fontSize: 20,
	fontWeight: "bold",
})

const Time = styled("div", {
	fontSize: 10,
	opacity: 0.5,
	display: "inline-block",
	marginLeft: 8,
})
