import type { ReactNode } from "react"
import { TanstackProvider } from "app/providers/tanstack/TanstackProvider"
import { RoutingProvider } from "./RoutingContext"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MotionConfig } from "motion/react"

export function Providers({ children }: { children: ReactNode }) {
	children = (
		<>
			<SpeedInsights />
			{children}
		</>
	)
	children = (
		<MotionConfig
			reducedMotion="user"
			transition={{ duration: 2, type: "spring" }}
		>
			{children}
		</MotionConfig>
	)
	children = <RoutingProvider>{children}</RoutingProvider>
	children = <TanstackProvider>{children}</TanstackProvider>
	return children
}
