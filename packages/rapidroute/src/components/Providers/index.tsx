import React, { ReactNode } from "react"

import { DarkModeProvider } from "./DarkMode"
import { NavigationProvider } from "./NavigationContext"
import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <RoutingProvider>
      <NavigationProvider>
        <DarkModeProvider>{children}</DarkModeProvider>
      </NavigationProvider>
    </RoutingProvider>
  )
}
