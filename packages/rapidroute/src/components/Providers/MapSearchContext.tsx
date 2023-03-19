import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { getAll } from "data/getData"
import { search } from "data/search"
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
    const id = getLocal("name")
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
    setLocal("name", activeItem)
  }, [activeItem])

  return (
    <MapSearchContext.Provider value={value}>
      {children}
    </MapSearchContext.Provider>
  )
}
