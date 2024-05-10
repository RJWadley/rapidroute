import { styled } from "@linaria/react"
import type { PlaceSearchItem } from "(temp)/components/TraditionalSelection/usePlaceSearch"
import { gsap } from "gsap"
import { useEffect, useRef } from "react"

export default function SearchResult({
  item,
  setItem,
  selected,
}: {
  item: PlaceSearchItem
  setItem: (item: PlaceSearchItem) => void
  selected: boolean
}) {
  const displayName = item.name
  const wrapperRef = useRef<HTMLButtonElement | null>(null)

  /**
   * if selected, scroll into view
   */
  useEffect(() => {
    if (!selected) return
    const onScreenBy = 200
    const wrapper = wrapperRef.current
    const position = wrapper?.getBoundingClientRect()
    if (!wrapper) return
    if (!position) return
    if (position.y < onScreenBy)
      gsap.to(window, {
        scrollTo: {
          y: wrapper,
          offsetY: onScreenBy,
        },
      })
    else if (position.y > window.innerHeight - onScreenBy)
      gsap.to(window, {
        scrollTo: {
          y: wrapper,
          offsetY: window.innerHeight - onScreenBy,
        },
      })
  }, [selected])

  return (
    <Wrapper ref={wrapperRef} onClick={() => setItem(item)} selected={selected}>
      {displayName}
    </Wrapper>
  )
}

const Wrapper = styled.button<{ selected?: boolean }>`
  background-color: ${(props) =>
    props.selected ? "var(--dark-background)" : "var(--mid-background)"};
  padding: 5px 6px;
  border-radius: 5px;
  cursor: pointer;

  :hover {
    background-color: var(--dark-background);
  }
`
