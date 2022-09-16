import React from "react"

import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return <RoutingProvider>{children}</RoutingProvider>
}
