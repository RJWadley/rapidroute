"use client"
import type { ReactNode } from "react"

import { DarkModeProvider } from "./DarkMode"
import { MapSearchProvider } from "./MapSearchContext"
import { NavigationProvider } from "./NavigationContext"
import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <RoutingProvider>
      <NavigationProvider>
        <MapSearchProvider>
          <DarkModeProvider>{children}</DarkModeProvider>
        </MapSearchProvider>
      </NavigationProvider>
    </RoutingProvider>
  )
}
