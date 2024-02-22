import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { prisma } from "database/client"
import type { ReactNode } from "react"

import { DarkModeProvider } from "./DarkMode"
import { MapSearchProvider } from "./MapSearchContext"
import { NavigationProvider } from "./NavigationContext"
import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient()

export default async function Providers({ children }: ProvidersProps) {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <RoutingProvider places={places}>
        <NavigationProvider>
          <MapSearchProvider>
            <DarkModeProvider>{children}</DarkModeProvider>
          </MapSearchProvider>
        </NavigationProvider>
      </RoutingProvider>
    </QueryClientProvider>
  )
}
