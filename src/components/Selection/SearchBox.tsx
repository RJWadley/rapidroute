import React, { useContext, useEffect } from "react"

import { getTextboxName } from "data/search"

import { RoutingContext } from "../Providers/RoutingContext"

interface SearchBoxProps {
  searchText: (text: string) => void
  sendKey: (key: string, boxRef: React.RefObject<HTMLInputElement>) => void
  searchRole: "from" | "to"
}

export default function SearchBox({
  searchText,
  sendKey,
  searchRole,
}: SearchBoxProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { to, from } = useContext(RoutingContext)

  const filterLocations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value ?? ""
    searchText(input)
  }

  const checkForEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sendKey(e.key, inputRef)

    // focus the next input box on the page
    // if this is the last input box on the page, focus the first input box on the page
    if (e.key === "Enter" && inputRef.current) {
      // get all siblings of the input box
      const siblings = Array.from(document.querySelectorAll("input") ?? [])

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

  return (
    <div>
      <input
        onChange={filterLocations}
        onKeyDown={checkForEnter}
        onFocus={() => {
          sendKey("Focus", inputRef)
        }}
        onBlur={() => sendKey("Blur", inputRef)}
        ref={inputRef}
        type="text"
        placeholder={`Search ${searchRole}`}
      />
    </div>
  )
}
