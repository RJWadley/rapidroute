import React, { useContext, useEffect, useRef, useState } from "react"

import styled, { css } from "styled-components"

import { getTextboxName } from "data/search"
import media from "utils/media"

import { RoutingContext } from "../Providers/RoutingContext"
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
    if (searchRole === "from" && inputRef.current && from)
      inputRef.current.value = getTextboxName(from)
  }, [from, searchRole])
  useEffect(() => {
    if (searchRole === "to" && inputRef.current && to)
      inputRef.current.value = getTextboxName(to)
  }, [searchRole, to])

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

  const handleInput = () => {
    setSearchFor(inputRef.current?.value.replace(/\n/g, "") ?? "")
    setShowSearchList(true)

    // check for newlines in the input
    if (inputRef.current?.value.includes("\n")) {
      inputRef.current.value = inputRef.current.value.replace(/\n/g, "")
      setShowSearchList(false)
      if (searchRole === "from") {
        document.getElementById("to")?.focus()
      }
      // update text to match the context
      if (searchRole === "from" && from)
        inputRef.current.value = getTextboxName(from)
      else if (searchRole === "to" && to)
        inputRef.current.value = getTextboxName(to)
    }

    updateSize()
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowSearchList(false)
    }, 200)
  }

  const highlightText = () => {
    if (inputRef.current) inputRef.current.select()
  }

  return (
    <>
      <Label>
        <Text
          id={searchRole}
          ref={inputRef}
          onChange={handleInput}
          placeholder={`Search ${searchRole}`}
          onFocus={() => {
            setShowSearchList(true)
            highlightText()
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
  font-size: 20px;
  height: 0px;
  text-align: ${props => (props.isTo ? "right" : "left")};
  overflow: hidden;

  //vertically center text
  display: flex;
  align-items: center;

  @media ${media.mobile} {
    font-size: 14px;
    text-align: left;

    ${props =>
      props.isTo
        ? css`
            align-self: start;
            margin-top: 10px;
          `
        : css`
            align-self: end;
            margin-bottom: 10px;
          `}
  }
`
