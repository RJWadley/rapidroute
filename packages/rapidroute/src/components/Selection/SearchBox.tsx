import React, { useContext, useEffect } from "react"

import { getTextboxName } from "data/search"

import styled from "styled-components"
import media from "utils/media"
import { RoutingContext } from "../Providers/RoutingContext"

interface SearchBoxProps {
  searchText: (text: string) => void
  sendKey: (key: string, boxRef: React.RefObject<HTMLTextAreaElement>) => void
  searchRole: "from" | "to"
}

export default function SearchBox({
  searchText,
  sendKey,
  searchRole,
}: SearchBoxProps): JSX.Element {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { to, from } = useContext(RoutingContext)

  const filterLocations = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value ?? ""
    searchText(input)
  }

  const checkForEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    sendKey(e.key, inputRef)

    // focus the next input box on the page
    // if this is the last input box on the page, focus the first input box on the page
    if (e.key === "Enter" && inputRef.current) {
      // get all siblings of the input box
      const siblings = Array.from(document.querySelectorAll("textarea") ?? [])

      // get the index of the input box in the siblings array
      const index = siblings.indexOf(inputRef.current)

      // if the index is the last index in the array, blur the input box
      if (index === siblings.length - 1) {
        inputRef.current.blur()
      }
      // otherwise, focus the next input box on the page
      else {
        siblings[index + 1].focus()
      }
    }
  }

  useEffect(() => {
    if (searchRole === "from" && inputRef.current && from)
      inputRef.current.value = getTextboxName(from)
  }, [from, searchRole])

  useEffect(() => {
    if (searchRole === "to" && inputRef.current && to)
      inputRef.current.value = getTextboxName(to)
  }, [to, searchRole])

  // automatically update the size of the input box to fit the text
  const updateSize = () => {
    if (inputRef.current) {
      // calculate the height of the input box
      inputRef.current.style.height = ""
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [from, to])

  return (
    <Label>
      <Text
        onChange={filterLocations}
        onKeyDown={checkForEnter}
        onInput={updateSize}
        onFocus={() => {
          sendKey("Focus", inputRef)
        }}
        onBlur={() => sendKey("Blur", inputRef)}
        ref={inputRef}
        id={searchRole}
        placeholder={`Search ${searchRole}`}
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
  )
}

const Label = styled.label`
  display: grid;
  align-items: center;
  height: 100%;
  padding: 0 30px;

  @media (max-width: ${media.small}px) {
    padding: 0 15px;
  }
`

const Text = styled.textarea`
  color: #333;
  font-size: 20px;
  height: 0px;

  //vertically center text
  display: flex;
  align-items: center;

  @media (max-width: ${media.small}px) {
    font-size: 14px;
  }
`
