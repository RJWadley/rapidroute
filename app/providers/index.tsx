import type { ReactNode } from "react"
import { TanstackProvider } from "app/providers/tanstack/tanstack-provider"
import { RoutingProvider } from "./routing-context"
import { SpeedInsights } from "@vercel/speed-insights/next"

export function Providers({ children }: { children: ReactNode }) {
	children = (
		<>
			<SpeedInsights />
			{children}
		</>
	)
	children = <RoutingProvider>{children}</RoutingProvider>
	children = <TanstackProvider>{children}</TanstackProvider>
	return children
}
