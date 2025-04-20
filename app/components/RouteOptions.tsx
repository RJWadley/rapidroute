"use client"

import { AnimatePresence, motion } from "motion/react"
import { useRouting } from "../providers/RoutingContext"
import Box from "./Box"
import TypeModeFilter from "./TypeModeFilter"

const layout = {
	layout: "position",
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
} as const

export default function RouteOptions() {
	const { status, routes, setPreferredRoute } = useRouting()

	return (
		<Box isVisible={status !== "skipped"}>
			<motion.div {...layout} layout="position">
				<TypeModeFilter>Result or whatever</TypeModeFilter>
			</motion.div>
			<AnimatePresence mode="popLayout" initial={false}>
				{status === "pending" && (
					<motion.div {...layout}>loading...</motion.div>
				)}
				{status === "error" && (
					<motion.div {...layout} key="error">
						error!
					</motion.div>
				)}
				{status === "404" && (
					<motion.div {...layout} key="404">
						no routes found
					</motion.div>
				)}
				{status === "success" && (
					<motion.div {...layout} key={routes.map((x) => x.id).join("-")}>
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
