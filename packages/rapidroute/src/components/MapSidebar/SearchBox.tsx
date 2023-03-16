import { useState } from "react"

import styled from "styled-components"

import media from "utils/media"

import SearchResults from "./SearchResults"
import useAdaptiveTextareaHeight from "./useAdaptiveTextareaHeight"
import useListArrowKeys from "./useListArrowKeys"

export default function MapSearchBox() {
  const [inputElement, setInputElement] = useState<HTMLTextAreaElement | null>(
    null
  )

  useAdaptiveTextareaHeight(inputElement)

  const { currentSearch, selectItem, focusedItem } =
    useListArrowKeys(inputElement)

  return (
    <>
      <Wrapper>
        <SearchBox
          ref={setInputElement}
          placeholder="Search the MRT"
          // disable spellcheck, autocorrect, and autocapitalize, grammarly, etc.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
      </Wrapper>
      <SearchResults
        items={currentSearch}
        setItem={selectItem}
        focusedItem={focusedItem}
      />
    </>
  )
}

const Wrapper = styled.div`
  background: var(--default-card-background);
  border-radius: 20px;
  position: sticky;
  top: 20px;

  @media ${media.mobile} {
    border-radius: 15px;
  }
`

const SearchBox = styled.textarea`
  width: 100%;
  height: 60px;
  vertical-align: top;
  padding: 20px;

  @media ${media.mobile} {
    padding-right: 60px;
  }
`
