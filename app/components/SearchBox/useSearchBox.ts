/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Place } from "@prisma/client"
import { useSearchResults } from "data/search"
import { emulateTab } from "emulate-tab"
import type { ComponentProps, RefObject } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { getTextboxName } from "./getTextboxName"

/**
 * This list will handle up and down arrow keys to navigate a list of items,
 * for example, you have a list of results and want the user to be able to
 * navigate the list with the arrow keys.
 */
export default function useSearchBox({
  initialPlaces,
  initiallySelectedPlace,
  onItemSelected,
}: {
  /**
   * the initial list of all places to search through
   */
  initialPlaces: Place[]
  /**
   * which place is initially selected (via search params)?
   */
  initiallySelectedPlace?: Place
  /**
   * a callback when the selected place changes
   */
  onItemSelected: (item: Place | undefined) => void
}): {
  /**
   * the current search results, or undefined if the suggestions dropdown is not visible
   */
  searchResults:
    | (Place & { selectItem: VoidFunction; highlighted: boolean })[]
    | undefined
  /**
   * props to be passed to the text area for event handling
   */
  inputProps: Partial<ComponentProps<"textarea">>
  /**
   * a function for the parent, to call an ancestor loses focus
   */
  onFocusLost: VoidFunction
} {
  /**
   * the currently selected item in the list
   * (or undefined if no item selected)
   */
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>(
    initiallySelectedPlace,
  )
  /**
   * what the user has physically typed into the input
   */
  const [userTyped, setUserTyped] = useState<string>()
  /**
   * current search results, based on the userTyped
   */
  const currentSearch = useSearchResults(userTyped, initialPlaces)
  /**
   * track if the dropdown should be open or closed
   */
  const [isOpen, setIsOpen] = useState(false)

  const selectPlace = (place: Place | undefined) => {
    setSelectedPlace(place)
    onItemSelected(place)
  }

  const currentIndex = selectedPlace ? currentSearch.indexOf(selectedPlace) : -1

  const move = (direction: "up" | "down") => {
    let nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (nextIndex < -1) nextIndex = currentSearch.length - 1
    if (nextIndex >= currentSearch.length) nextIndex = -1
    const nextItem = currentSearch[nextIndex]
    selectPlace(nextItem)
  }

  const boxText =
    currentIndex === -1 ? userTyped : getTextboxName(selectedPlace)

  return {
    onFocusLost: () => {
      if (document.hasFocus()) setIsOpen(false)
    },
    searchResults: isOpen
      ? currentSearch.map((item) => ({
          ...item,
          selectItem: () => {
            setIsOpen(false)
            selectPlace(item)
          },
          highlighted: selectedPlace?.id === item.id,
        }))
      : undefined,
    inputProps: {
      value:
        isOpen || !selectedPlace
          ? boxText?.trim()
          : getTextboxName(selectedPlace),
      onFocus: () => {
        setIsOpen(true)
      },
      onInput: (e) => {
        const newValue = e.currentTarget.value
        setUserTyped(newValue)
        setSelectedPlace(undefined)
        setIsOpen(true)

        if (/^\s+$/.test(newValue)) {
          selectPlace(undefined)
        } else if (newValue.includes("\n")) {
          const newActiveItem = selectedPlace ?? currentSearch[0]
          selectPlace(newActiveItem)
          setIsOpen(false)
          emulateTab()
        }
      },
      onKeyDown: (e) => {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault()
            move("up")

            break

          case "ArrowDown":
            e.preventDefault()
            move("down")

            break

          case "Tab":
            setIsOpen(false)
            break

          case "Escape":
            e.preventDefault()
            setIsOpen(false)
            emulateTab()

            break
        }
      },
    },
  }
}
