import React, { useEffect, useRef } from "react"
import styled from "styled-components"
import gsap from "gsap"
import media from "utils/media"

type LocationId = string

type SearchListProps = {
  locations: LocationId[]
  currentlySelected: number
  setSelectedIndex: (index: number) => void
  show: boolean
}

export default function SearchList({
  locations,
  currentlySelected,
  setSelectedIndex,
  show,
}: SearchListProps): JSX.Element {
  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.innerWidth > media.small)
      gsap.to(wrapper.current, {
        marginTop: show ? "-30px" : "-90px",
        borderTopLeftRadius: show ? "0px" : "30px",
        borderTopRightRadius: show ? "0px" : "30px",
        height: show ? "auto" : 0,
        opacity: show ? 1 : 0,
      })
    else
      gsap.to(wrapper.current, {
        marginTop: show ? "-25px" : "-55px",
        borderTopLeftRadius: show ? "0px" : "25px",
        borderTopRightRadius: show ? "0px" : "25px",
        height: show ? "auto" : 0,
        opacity: show ? 1 : 0,
      })
  }, [show])

  return (
    <Wrapper ref={wrapper}>
      {locations.map((loc, i) => (
        <Option
          key={loc}
          onClick={() => setSelectedIndex(i)}
          selected={i === currentlySelected}
          data-flip-id={loc}
        >
          {loc}
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
  z-index: -1;
  position: relative;
  border-radius: 30px;
  display: grid;
  gap: 3px;
  font-size: 16px;
  overflow: hidden;
  opacity: 0;
  margin-top: -90px;

  @media (max-width: ${media.small}px) {
    padding: 15px;
    padding-top: 40px;
    border-radius: 0 0 25px 25px;
  }
`

const Option = styled.div<{ selected: boolean }>`
  background-color: ${props => (props.selected ? "#ccc" : "#ddd")};
  padding: 3px 6px;
  border-radius: 5px;
`
