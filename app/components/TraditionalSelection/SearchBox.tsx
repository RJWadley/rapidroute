/* eslint-disable styled-components-a11y/label-has-associated-control */
"use client"

import { styled } from "@linaria/react"
import { RoutingContext } from "components/Providers/RoutingContext"
import type { PlaceSearchItem } from "data/usePlaceSearch"
import usePlaceSearch from "data/usePlaceSearch"
import { useContext, useState } from "react"
import media from "utils/media"
import useAdaptiveTextareaHeight from "utils/useAdaptiveTextareaHeight"

import SearchList from "./SearchList"

interface SearchBoxProps {
  searchRole: "from" | "to"
  places: PlaceSearchItem[]
}

export default function SearchBox({ searchRole, places }: SearchBoxProps) {
  const [input, setInput] = useState<HTMLTextAreaElement | null>(null)
  const { to, from, setTo, setFrom } = useContext(RoutingContext)

  const placeId = searchRole === "to" ? to : from
  const setPlaceId = searchRole === "to" ? setTo : setFrom
  const place = places.find((p) => p.id === placeId?.id)

  useAdaptiveTextareaHeight(input)

  const { currentSearch, focusedItem, selectItem } = usePlaceSearch(
    input,
    [place, setPlaceId],
    places
  )

  return (
    <>
      <Box htmlFor={searchRole}>
        <Text
          id={searchRole}
          name={searchRole}
          ref={setInput}
          placeholder={`Search ${searchRole}`}
          isTo={searchRole === "to"}
          // disable spellcheck, autocorrect, and autocapitalize, grammarly, etc.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
      </Box>
      <SearchList
        items={currentSearch}
        focusedItem={focusedItem}
        selectItem={selectItem}
      />
    </>
  )
}

const Box = styled.label`
  display: grid;
  align-items: center;
  height: 100%;
  padding: 0 30px;
  cursor: text;

  @media ${media.mobile} {
    padding: 0 20px;
  }
`

const Text = styled.textarea<{ isTo: boolean }>`
  color: var(--default-text);
  font-size: var(--extra-small);
  height: 20px;
  text-align: ${(props) => (props.isTo ? "right" : "left")};
  overflow: hidden;

  /* vertically center text */
  display: flex;
  align-items: center;

  @media ${media.mobile} {
    text-align: left;
    margin: 10px 0;
    align-self: ${(props) => (props.isTo ? "start" : "end")};
  }
`
