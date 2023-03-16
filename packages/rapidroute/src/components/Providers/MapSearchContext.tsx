import { createContext, ReactNode, useMemo, useState } from "react"

export const MapSearchContext = createContext<{
  /**
   * the id of the active item on the map
   */
  activeItem: string
  /**
   * update the id of the active item on the map
   */
  setActiveItem: React.Dispatch<React.SetStateAction<string>>
}>({
  activeItem: "",
  setActiveItem: () => {},
})

export function MapSearchProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [activeItem, setActiveItem] = useState("")

  const value = useMemo(() => {
    return {
      activeItem,
      setActiveItem,
    }
  }, [activeItem])

  return (
    <MapSearchContext.Provider value={value}>
      {children}
    </MapSearchContext.Provider>
  )
}
