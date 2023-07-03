import useAdaptiveTextareaHeight from "components/MapSidebar/useAdaptiveTextareaHeight"
import usePlaceSearch from "components/MapSidebar/usePlaceSearch"
import { RoutingContext } from "components/Providers/RoutingContext"
import { useContext, useState } from "react"
import styled, { css } from "styled-components"
import media from "utils/media"

import SearchList from "./SearchList"

interface SearchBoxProps {
  searchRole: "from" | "to"
}

export default function SearchBox({ searchRole }: SearchBoxProps) {
  const [input, setInput] = useState<HTMLTextAreaElement | null>(null)
  const { to, from, setTo, setFrom } = useContext(RoutingContext)

  const place = searchRole === "to" ? to : from
  const setPlace = searchRole === "to" ? setTo : setFrom

  useAdaptiveTextareaHeight(input)

  const { currentSearch, focusedItem, selectItem } = usePlaceSearch(input, [
    place ?? "",
    setPlace,
  ])

  return (
    <>
      <Label htmlFor={searchRole}>
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
      </Label>
      <SearchList
        items={currentSearch}
        focusedItem={focusedItem}
        selectItem={selectItem}
      />
    </>
  )
}

const Label = styled.label`
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
  text-align: ${props => (props.isTo ? "right" : "left")};
  overflow: hidden;

  /* vertically center text */
  display: flex;
  align-items: center;

  @media ${media.mobile} {
    text-align: left;
    margin: 10px 0;

    ${props =>
      props.isTo
        ? css`
            align-self: start;
          `
        : css`
            align-self: end;
          `}
  }
`
