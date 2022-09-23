import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import styled from "styled-components"
import gsap from "gsap"
import media from "utils/media"
import { getAll } from "data/getData"
import { SearchIndex } from "@rapidroute/database-types"
import { RoutingContext } from "components/Providers/RoutingContext"
import { search } from "data/search"
import useMedia from "utils/useMedia"

type SearchListProps = {
  searchRole: "from" | "to"
  searchFor: string
  show: boolean
}

export default function SearchList({
  searchRole,
  show,
  searchFor,
}: SearchListProps): JSX.Element {
  const wrapper = useRef<HTMLDivElement>(null)
  const [allLocations, setAllLocations] = React.useState<SearchIndex[string][]>(
    []
  )
  const [searchResults, setSearchResults] = useState<SearchIndex[string][]>([])
  const { setFrom, setTo } = useContext(RoutingContext)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const isMobile = useMedia(media.mobile)

  // get initial data for the search list locations
  useEffect(() => {
    getAll("searchIndex").then(data => {
      setAllLocations(Object.values(data))
    })
  }, [])

  // update the search list when the search box changes
  useEffect(() => {
    const results = search(searchFor)
    setSearchResults(
      allLocations.filter(location => results.includes(location.uniqueId))
    )
  }, [allLocations, searchFor])

  // animate showing and hiding the search list
  // also update the highlighted index when the search list is shown
  useEffect(() => {
    if (show) setHighlightedIndex(0)
    if (!isMobile)
      gsap.to(wrapper.current, {
        height: show ? "auto" : 0,
        pointerEvents: show ? "auto" : "none",
        y: show ? 0 : -60,
        borderTopLeftRadius: show ? 0 : 30,
        borderTopRightRadius: show ? 0 : 30,
      })
    else
      gsap.to(wrapper.current, {
        height: show ? "auto" : 0,
        pointerEvents: show ? "auto" : "none",
        y: show ? 0 : -25,
        borderTopLeftRadius: show ? 0 : 30,
        borderTopRightRadius: show ? 0 : 30,
      })
  }, [isMobile, show])

  const setPlace = useCallback(
    (place: string) => {
      if (searchRole === "from") setFrom(place)
      else setTo(place)
    },
    [searchRole, setFrom, setTo]
  )

  // handle key presses
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!show) return
      if (event.key === "ArrowDown") {
        if (highlightedIndex < allLocations.length - 1)
          setHighlightedIndex(highlightedIndex + 1)
      } else if (event.key === "ArrowUp") {
        if (highlightedIndex > 0) setHighlightedIndex(highlightedIndex - 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [highlightedIndex, allLocations, setPlace, show, searchResults])

  // when closing the search list, select the highlighted location
  useEffect(() => {
    const id = searchResults[highlightedIndex]?.uniqueId
    if (!show && id) setPlace(id)
  }, [show, highlightedIndex, searchResults, setPlace])

  return (
    <Wrapper ref={wrapper}>
      {searchResults.map((loc, i) => (
        <Option
          key={loc.uniqueId}
          onClick={() => {
            setHighlightedIndex(i)
          }}
          selected={highlightedIndex === i}
        >
          {loc.d}
        </Option>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background-color: #ddd;
  padding: 30px;
  padding-top: 60px;
  border-radius: 30px;
  display: grid;
  gap: 3px;
  font-size: 16px;
  overflow: hidden;
  position: absolute;
  top: calc(100% - 30px);
  left: 0;
  right: 0;
  z-index: -2;
  transform: translateY(-61px);

  @media ${media.mobile} {
    padding: 15px;
    padding-top: 40px;
    border-radius: 25px;
    transform: translateY(-25px);
  }
`

const Option = styled.div<{ selected: boolean }>`
  background-color: ${props => (props.selected ? "#ccc" : "#ddd")};
  padding: 3px 6px;
  border-radius: 5px;
  cursor: pointer;
`
