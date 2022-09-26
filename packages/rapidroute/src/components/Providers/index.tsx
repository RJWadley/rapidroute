import React, { ReactNode } from "react"

import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return <RoutingProvider>{children}</RoutingProvider>
}
