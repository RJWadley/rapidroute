import type { ReactNode } from "react"
import { TanstackProvider } from "app/TanstackProvider"
import { RoutingProvider } from "./RoutingContext"

export function Providers({ children }: { children: ReactNode }) {
	children = <RoutingProvider>{children}</RoutingProvider>
	children = <TanstackProvider>{children}</TanstackProvider>
	return children
}
