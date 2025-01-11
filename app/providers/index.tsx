"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { TanstackProvider } from "app/providers/tanstack/TanstackProvider"
import { SetupTheme } from "app/utils/theme"
import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"
import { RoutingProvider } from "./RoutingContext"

export function Providers({ children }: { children: ReactNode }) {
	children = (
		<>
			<SpeedInsights />
			<SetupTheme />
			{children}
		</>
	)
	children = (
		<MotionConfig
			reducedMotion="user"
			transition={{ type: "spring", bounce: 0.1 }}
		>
			{children}
		</MotionConfig>
	)
	children = <RoutingProvider>{children}</RoutingProvider>
	children = <TanstackProvider>{children}</TanstackProvider>
	return children
}
