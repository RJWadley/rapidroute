import { motion } from "motion/react"
import type { ComponentProps } from "react"

export const ChevronRight = (props: ComponentProps<typeof motion.svg>) => (
	<motion.svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 -960 960 960"
		width="24px"
		fill="currentColor"
		{...props}
	>
		<title>Chevron Right</title>
		<path d="M504-480 348-636q-11-11-11-28t11-28q11-11 28-11t28 11l184 184q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L404-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l156-156Z" />
	</motion.svg>
)
