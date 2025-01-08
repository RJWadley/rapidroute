"use client"

import type { ReactNode } from "react"
import { TanstackProvider } from "app/providers/tanstack/TanstackProvider"
import { RoutingProvider } from "./RoutingContext"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MotionConfig } from "motion/react"
import { MovementProvider } from "app/components/MapMovement"
import { SetupTheme } from "app/utils/theme"

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
	children = <MovementProvider>{children}</MovementProvider>
	children = <RoutingProvider>{children}</RoutingProvider>
	children = <TanstackProvider>{children}</TanstackProvider>
	return children
}
