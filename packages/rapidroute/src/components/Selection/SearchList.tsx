import { SearchIndex } from "@rapidroute/database-types"
import { RoutingContext } from "components/Providers/RoutingContext"
import { getAll } from "data/getData"
import isCoordinate from "data/isCoordinate"
import { search } from "data/search"
import gsap from "gsap"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import media from "utils/media"
import useMedia from "utils/useMedia"

interface SearchListProps {
  searchRole: "from" | "to"
  searchFor: string
  show: boolean
}

const CURRENT_LOCATION = "Current Location"

export default function SearchList({
  searchRole,
  show,
  searchFor,
}: SearchListProps): JSX.Element {
  const wrapper = useRef<HTMLDivElement>(null)
  const [allLocations, setAllLocations] = useState<SearchIndex[string][]>([])
  const [searchResults, setSearchResults] = useState<SearchIndex[string][]>([])
  const { setFrom, setTo } = useContext(RoutingContext)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const isMobile = useMedia(media.mobile)

  // restrict highlighting to search results
  const restrictToBounds = useCallback(() => {
    if (highlightedIndex < 0) {
      setHighlightedIndex(searchResults.length - 1)
    } else if (highlightedIndex >= searchResults.length) {
      setHighlightedIndex(0)
    }
  }, [highlightedIndex, searchResults.length])

  // get initial data for the search list locations
  useEffect(() => {
    getAll("searchIndex")
      .then(data => {
        return setAllLocations(Object.values(data))
      })
      .catch(error => {
        console.error("error getting all locations", error)
        setAllLocations([])
      })
  }, [])

  // update the search list when the search box changes
  useEffect(() => {
    const results = search(searchFor)
    if (results.length === 0) {
      setSearchResults([
        {
          uniqueId: CURRENT_LOCATION,
          d: CURRENT_LOCATION,
          i: CURRENT_LOCATION,
        },
      ])
    }
    setSearchResults(
      results.flatMap(result => {
        if (isCoordinate(result) || result === CURRENT_LOCATION)
          return [
            {
              uniqueId: result,
              d: result,
              i: result,
            },
          ]
        return allLocations.find(location => location.uniqueId === result) ?? []
      })
    )
  }, [allLocations, searchFor])

  // animate showing and hiding the search list
  // also update the highlighted index when the search list is shown
  const previousWasInput = useRef(false)
  useEffect(() => {
    const onFocusChange = () => {
      previousWasInput.current =
        document.activeElement?.tagName === "TEXTAREA" ? true : false
    }
    window.addEventListener("focusin", onFocusChange)
    return () => {
      window.removeEventListener("focusin", onFocusChange)
    }
  }, [])
  useEffect(() => {
    const currentActiveIsInput = document.activeElement?.tagName === "TEXTAREA"
    const duration =
      currentActiveIsInput && previousWasInput.current ? 0.001 : 0.5
    if (show) setHighlightedIndex(0)
    if (isMobile) {
      gsap.to(wrapper.current, {
        height: show ? "auto" : 0,
        pointerEvents: show ? "auto" : "none",
        y: show ? 0 : -26,
        borderTopLeftRadius: show ? 0 : 30,
        borderTopRightRadius: show ? 0 : 30,
        duration,
        ease: show ? "power3.out" : "power3.inOut",
      })
    } else {
      gsap.to(wrapper.current, {
        height: show ? "auto" : 0,
        pointerEvents: show ? "auto" : "none",
        y: show ? 0 : -60,
        borderTopLeftRadius: show ? 0 : 30,
        borderTopRightRadius: show ? 0 : 30,
        duration,
        ease: show ? "power3.out" : "power3.inOut",
      })
    }
  }, [isMobile, show])

  const setPlace = useCallback(
    (place: string | null | undefined) => {
      if (searchRole === "from" && place !== undefined) setFrom(place)
      else if (place !== undefined) setTo(place)
    },
    [searchRole, setFrom, setTo]
  )

  // handle key presses
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!show) return
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setHighlightedIndex(highlightedIndex + 1)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        setHighlightedIndex(highlightedIndex - 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [
    highlightedIndex,
    allLocations,
    setPlace,
    show,
    searchResults,
    restrictToBounds,
  ])

  // when closing the search list, select the highlighted location
  useEffect(() => {
    const id = searchResults[highlightedIndex]?.uniqueId
    if (!show) setPlace(id)
  }, [show, highlightedIndex, searchResults, setPlace])

  // when selected index changes, make sure it is in view
  useEffect(() => {
    const onScreenBy = 200
    if (highlightedIndex === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    restrictToBounds()
    const highlightedElement = wrapper.current?.children[highlightedIndex]
    const position = highlightedElement?.getBoundingClientRect()
    if (!position) return
    if (position.y < onScreenBy)
      gsap.to(window, {
        scrollTo: {
          y: highlightedElement,
          offsetY: onScreenBy,
        },
      })
    else if (position.y > window.innerHeight - onScreenBy)
      gsap.to(window, {
        scrollTo: {
          y: highlightedElement,
          offsetY: window.innerHeight - onScreenBy,
        },
      })
  }, [highlightedIndex, restrictToBounds])

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
      {searchResults.length === 0 && "Start typing to search"}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  height: 0;
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--mid-background);
  padding: 30px;
  padding-top: 60px;
  border-radius: 30px;
  display: grid;
  font-size: var(--extra-small);
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

const Option = styled.button<{ selected: boolean }>`
  background-color: ${props =>
    props.selected ? "var(--dark-background)" : "var(--mid-background)"};
  padding: 5px 6px;
  border-radius: 5px;
  cursor: pointer;
`
