import React, { ReactNode } from "react"

import { DarkModeProvider } from "./DarkMode"
import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <RoutingProvider>
      <DarkModeProvider>{children}</DarkModeProvider>
    </RoutingProvider>
  )
}
