import type { ReactNode } from "react"
import { createContext, useEffect, useMemo, useRef, useState } from "react"
import { getLocal, setLocal } from "utils/localUtils"

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
  setActiveItem: () => {
    throw new Error("no provider")
  },
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

  // sync from URL param
  useEffect(() => {
    // TODO finish this
    // const id = getLocal("name")
    // if (id) {
    //   getAll("searchIndex")
    //     .then((index) => {
    //       return setActiveItem(
    //         index[id]?.uniqueId ??
    //           search(id).find((x) => x !== "Current Location") ??
    //           id,
    //       )
    //     })
    //     .catch(console.error)
    // }
  }, [])

  // sync to URL param
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setLocal("name", activeItem)
  }, [activeItem])

  return (
    <MapSearchContext.Provider value={value}>
      {children}
    </MapSearchContext.Provider>
  )
}
