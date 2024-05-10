import { prisma } from "(temp)/data/client"
import type { ReactNode } from "react"

import { DarkModeProvider } from "./DarkMode"
import QueryProvider from "./QueryProvider"
import { RoutingProvider } from "./RoutingContext"

interface ProvidersProps {
  children: ReactNode
}

export default async function Providers({ children }: ProvidersProps) {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <QueryProvider>
      <RoutingProvider places={places}>
        <DarkModeProvider>{children}</DarkModeProvider>
      </RoutingProvider>
    </QueryProvider>
  )
}
