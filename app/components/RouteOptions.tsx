"use client"

import { useSearchParamState } from "app/utils/useSearchParamState"
import Box from "./Box"
import { AnimatePresence, motion } from "motion/react"
import TypeModeFilter from "./TypeModeFilter"
import { useRouting } from "./RoutingContext"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

export default function RouteOptions() {
	const { status, routes, setPreferredRoute } = useRouting()
	const [from] = useSearchParamState("from")
	const [to] = useSearchParamState("to")

	return (
		<Box isVisible={status !== "skipped"}>
			<AnimatePresence mode="popLayout" initial={false}>
				{status === "pending" && (
					<motion.div {...layout} key="loading">
						<TypeModeFilter key="mode" />
						loading...
					</motion.div>
				)}
				{status === "error" && (
					<motion.div {...layout} key="error">
						<TypeModeFilter key="mode" />
						error!
					</motion.div>
				)}
				{status === "404" && (
					<motion.div {...layout} key="404">
						<TypeModeFilter key="mode" />
						no routes found
					</motion.div>
				)}
				{status === "success" && (
					<motion.div {...layout} key={`${from}-${to}`}>
						<TypeModeFilter key="mode" />
						the following options are available:
						{routes.map((route, index) => (
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
