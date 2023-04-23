import { RoutingContext } from "components/Providers/RoutingContext"
import { getTextboxName } from "data/search"
import { useContext, useEffect, useRef, useState } from "react"
import styled, { css } from "styled-components"
import media from "utils/media"

import SearchList from "./SearchList"

interface SearchBoxProps {
  searchRole: "from" | "to"
}

export default function SearchBox({ searchRole }: SearchBoxProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [searchFor, setSearchFor] = useState("")
  const [showSearchList, setShowSearchList] = useState(false)
  const { to, from } = useContext(RoutingContext)

  // update the search box when the context changes
  useEffect(() => {
    if (searchRole === "from" && inputRef.current)
      inputRef.current.value = getTextboxName(from)
  }, [from, searchRole])
  useEffect(() => {
    if (searchRole === "to" && inputRef.current)
      inputRef.current.value = getTextboxName(to)
  }, [searchRole, to])

  // false positive
  const handleInput = () => {
    setSearchFor(inputRef.current?.value.replace(/\n/g, "") ?? "")
    setShowSearchList(true)

    // check for newlines in the input
    if (inputRef.current?.value.includes("\n")) {
      inputRef.current.value = inputRef.current.value.replace(/\n/g, "")
      setShowSearchList(false)

      const toElement = document.querySelector("#to")
      if (toElement instanceof HTMLTextAreaElement) {
        if (searchRole === "from") {
          toElement.focus()
        } else {
          toElement.blur()
        }
      }

      // update text to match the context
      inputRef.current.value = getTextboxName(searchRole === "from" ? from : to)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowSearchList(false)
    }, 200)
  }

  return (
    <>
      <Label htmlFor={searchRole}>
        <Text
          id={searchRole}
          name={searchRole}
          ref={inputRef}
          onChange={handleInput}
          placeholder={`Search ${searchRole}`}
          onFocus={() => {
            setShowSearchList(true)
          }}
          onBlur={handleBlur}
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
        show={showSearchList}
        searchFor={searchFor}
        searchRole={searchRole}
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
