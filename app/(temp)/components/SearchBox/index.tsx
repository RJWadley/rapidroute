/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable styled-components-a11y/no-autofocus */
import { styled } from "@linaria/react"
import HistorySVG from "@material-symbols/svg-700/sharp/history.svg"
import SearchSVG from "@material-symbols/svg-700/sharp/search.svg"
import type { Place } from "@prisma/client"
import { useClickAway, useKeyPress } from "ahooks"
import { useEffect, useRef, useState } from "react"
import { colors, sizes } from "(temp)/style"
import { runImport } from "(temp)/updater"
import useAdaptiveTextareaHeight from "(temp)/utils/useAdaptiveTextareaHeight"

import { getTextboxName } from "./getTextboxName"
import useSearchBox from "./useSearchBox"

export interface SearchItem {
  id: string
  displayText: string
  icon: "search" | "recent"
}

function Icon({ type }: { type: "search" | "recent" }) {
  if (type === "search") return <SearchSVG />
  return <HistorySVG />
}

export default function SearchBox({
  initialPlaces,
}: {
  initialPlaces: Place[]
}) {
  const [input, setInput] = useState<HTMLTextAreaElement | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)

  const { inputProps, searchResults, onFocusLost } = useSearchBox({
    initialPlaces,
    initiallySelectedPlace: undefined,
    onItemSelected: (item) => console.log(item),
  })

  useAdaptiveTextareaHeight(input)
  useClickAway(onFocusLost, wrapper)
  useKeyPress("ctrl.k", () => input?.focus())
  useKeyPress("meta.k", () => input?.focus())

  return (
    <PositionAnchor ref={wrapper}>
      <Wrapper>
        <Input
          autoFocus
          ref={setInput}
          placeholder="Search the MRT"
          {...inputProps}
        />
        <SearchIcon />
      </Wrapper>
      {searchResults ? (
        <Suggestions>
          {searchResults.length === 0 ? "No Results" : null}
          {searchResults.map((suggestion) => (
            <Suggestion
              key={suggestion.id}
              onClick={() => suggestion.selectItem()}
              style={{
                color: suggestion.highlighted ? "red" : "black",
              }}
            >
              <Icon type="search" />
              <span>{getTextboxName(suggestion)}</span>
            </Suggestion>
          ))}
        </Suggestions>
      ) : null}
    </PositionAnchor>
  )
}

const PositionAnchor = styled.div`
  position: relative;
`

const Wrapper = styled.label`
  background: ${colors.defaultCardBackground};
  border-radius: ${sizes.borderRadius};
  padding: 20px 30px;
  display: grid;
  grid-template-columns: 1fr auto;
  cursor: text;
  position: relative;
  z-index: 2;
`

const Input = styled.textarea`
  place-self: center;
  width: 100%;
  height: 20px;
  overflow-wrap: break-word;

  &:focus {
    outline: none;
  }
`

const SearchIcon = styled(SearchSVG)`
  width: 30px;
  height: 30px;
  fill: ${colors.defaultText};
`

const Suggestions = styled.div`
  background: ${colors.darkBackground};
  padding: calc(${sizes.borderRadius} + 20px) 20px 20px;
  margin-top: -${sizes.borderRadius};
`

const Suggestion = styled.button`
  display: block;
`
