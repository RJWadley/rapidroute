"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { SetupTheme } from "app/utils/theme"
import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"
import { RoutingProvider } from "./RoutingContext"
import { TRPCReactProvider } from "app/api/trpc/client"

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
			transition={{ type: "spring", bounce: 0.1, visualDuration: 0.5 }}
		>
			{children}
		</MotionConfig>
	)

	children = <RoutingProvider>{children}</RoutingProvider>
	children = <TRPCReactProvider>{children}</TRPCReactProvider>

	return children
}
