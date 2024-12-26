"use client"

import { useSearchParamState } from "app/utils/useSearchParamState"
import { useRouting } from "./RoutingContext"
import Box from "./Box"
import { AnimatePresence, motion } from "motion/react"
import TypeModeFilter from "./TypeModeFilter"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

export default function RouteOptions() {
	const { routes, isLoading, isError, setPreferredRoute } = useRouting()
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")

	const state = isError
		? "error"
		: isLoading && from && to
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
					<motion.div {...layout} key="loading">
						<TypeModeFilter key="mode" />
						loading...
					</motion.div>
				)}
				{state === "error" && (
					<motion.div {...layout} key="error">
						<TypeModeFilter key="mode" />
						error!
					</motion.div>
				)}
				{state === "404" && (
					<motion.div {...layout} key="404">
						<TypeModeFilter key="mode" />
						no routes found
					</motion.div>
				)}
				{state === "success" && (
					<motion.div {...layout} key={`${from}-${to}`}>
						<TypeModeFilter key="mode" />
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
