import { ReactNode } from "react"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import { DarkModeProvider } from "./DarkMode"
import { MapSearchProvider } from "./MapSearchContext"
import { NavigationProvider } from "./NavigationContext"
import { RoutingProvider } from "./RoutingContext"

const queryClient = new QueryClient()

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RoutingProvider>
        <NavigationProvider>
          <MapSearchProvider>
            <DarkModeProvider>{children}</DarkModeProvider>
          </MapSearchProvider>
        </NavigationProvider>
      </RoutingProvider>
    </QueryClientProvider>
  )
}
