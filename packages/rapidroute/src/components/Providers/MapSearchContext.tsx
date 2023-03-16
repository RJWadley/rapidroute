import { createContext, ReactNode, useEffect, useMemo, useState } from "react"

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

  // sync to and from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("name")
    if (id) setActiveItem(id)
  }, [])
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (activeItem) urlParams.set("name", activeItem)
    else urlParams.delete("name")
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}?${urlParams.toString()}`
    )
  }, [activeItem])

  return (
    <MapSearchContext.Provider value={value}>
      {children}
    </MapSearchContext.Provider>
  )
}
