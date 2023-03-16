import { createContext, ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { getAll } from "data/getData"
import { search } from "data/search"

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
    if (id)
      getAll("searchIndex")
        .then(index => {
          setActiveItem(
            index[id]?.uniqueId ??
              search(id).filter(x => x !== "Current Location")[0] ??
              id
          )
        })
        .catch(console.error)
  }, [])
  
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
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
