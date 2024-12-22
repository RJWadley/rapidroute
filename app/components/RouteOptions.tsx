"use client"

import { useSearchParamState } from "app/utils/useSearchParamState"
import { useRouting } from "./RoutingContext"
import Box from "./Box"
import { AnimatePresence, motion } from "motion/react"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

export default function RouteOptions() {
	const { routes, isLoading, setPreferredRoute } = useRouting()
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")

	const state =
		isLoading && from && to
			? "loading"
			: !from || !to
				? "empty"
				: !routes
					? "empty"
					: routes.length === 0
						? "404"
						: "success"

	return (
		<Box isVisible={state !== "empty"}>
			<AnimatePresence mode="popLayout" initial={false}>
				{state === "loading" && (
					<motion.h1 {...layout} key="loading">
						loading...
					</motion.h1>
				)}
				{state === "404" && (
					<motion.h1 {...layout} key="404">
						no routes found
					</motion.h1>
				)}
				{state === "success" && (
					<motion.div {...layout} key={`${from}-${to}`}>
						the following options are available:
						{routes?.map((route, index) => (
							<button
								type="button"
								key={route.id}
								onClick={() => setPreferredRoute(index)}
							>
								route number {index + 1}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</Box>
	)
}
