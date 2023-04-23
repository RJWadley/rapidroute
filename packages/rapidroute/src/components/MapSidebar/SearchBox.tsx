import { MapSearchContext } from "components/Providers/MapSearchContext"
import { useContext, useState } from "react"
import styled from "styled-components"
import { setLocal } from "utils/localUtils"
import media from "utils/media"

import SearchResults from "./SearchResults"
import useAdaptiveTextareaHeight from "./useAdaptiveTextareaHeight"
import useListArrowKeys from "./useListArrowKeys"

export default function MapSearchBox() {
  const [inputElement, setInputElement] = useState<HTMLTextAreaElement | null>(
    null
  )
  const { activeItem, setActiveItem } = useContext(MapSearchContext)

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
        {activeItem && (
          <Close
            type="button"
            onClick={() => {
              if (inputElement) {
                inputElement.value = ""
                setActiveItem("")
                setLocal("lastMapInteraction", new Date())
              }
            }}
          >
            close
          </Close>
        )}
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
  z-index: 1;
  box-shadow: 5px 5px 10px rgb(0 0 0 / 20%);
  display: flex;

  @media ${media.mobile} {
    border-radius: 15px;
  }
`

const SearchBox = styled.textarea`
  width: 100%;
  height: 60px;
  vertical-align: top;
  padding: 20px;
  padding-right: 0;
`

const Close = styled.button`
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  padding: 0 20px;
  cursor: pointer;
  height: 60px;

  @media ${media.mobile} {
    margin-right: 55px;
  }
`
