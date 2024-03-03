import { useEventListener } from "ahooks"
import { useCallback, useEffect, useRef, useState } from "react"

import { useSearchResults } from "./search"

export interface PlaceSearchItem {
  id: string
  name: string
}

const location = { name: "Current Location", id: "Current Location" }

/**
 * This list handles logic for search boxes, including:
 * scrolling up and down a list using the arrow keys,
 * selecting an item when the user presses enter, and
 * searching the list of locations
 *
 * and gives you everything you need to display the list and make it interactive
 */
export default function usePlaceSearch(
  inputElement: HTMLTextAreaElement | null,
  state: [PlaceSearchItem | undefined, (item: PlaceSearchItem | null) => void],
  places: PlaceSearchItem[],
) {
  /**
   * the currently selected item
   */
  const [activeItem, setActiveItem] = state
  /**
   * the item that is currently highlighted (via arrow keys)
   */
  const [focusedItem, setFocusedItem] = useState<PlaceSearchItem>()
  /**
   * what the user has physically typed into the input
   */
  const [userTyped, setUserTyped] = useState<string>()
  /**
   * search results for what the user has typed
   */
  const currentSearch = useSearchResults(
    userTyped,
    [...places, location],
    (place) => JSON.stringify(place),
  )

  /**
   * true when the active item is about to update and this hook caused it
   */
  const activeUpdateInternal = useRef(false)

  const setInputText = useCallback(
    (item: PlaceSearchItem | undefined) => {
      if (inputElement && item) inputElement.value = item.name
      else if (inputElement) inputElement.value = ""
    },
    [inputElement],
  )

  /**
   * select a new item internally
   * @param item the item to select
   * @param closeMenu whether to close the menu
   */
  const updateItem = useCallback(
    (item: PlaceSearchItem | undefined, closeMenu = false) => {
      if (closeMenu) {
        setUserTyped(undefined)
        setInputText(item)
        inputElement?.blur()
      }
      activeUpdateInternal.current = true
      setActiveItem(item ?? null)
    },
    [inputElement, setActiveItem, setInputText],
  )

  /**
   * select a new item from outside this hook
   * e.g. when the user clicks on a list item
   * @param item the item to select
   */
  const updateItemExternally = (item: PlaceSearchItem) => {
    setInputText(item)
    setUserTyped(undefined)
    setActiveItem(item)
  }

  /**
   * when the active item changes from a source we don't control,
   * update the input value to match
   */
  useEffect(() => {
    if (activeUpdateInternal.current) {
      activeUpdateInternal.current = false
    } else {
      setInputText(activeItem)
    }
  }, [activeItem, setInputText])

  /**
   * handle text input on the box
   */
  const handleInput = (e: Event) => {
    setUserTyped(inputElement?.value)
    setFocusedItem(undefined)

    // if the box is empty, select nothing
    // otherwise, check if the user has pressed enter
    // mobile devices don't have enter, so we check for a newline instead
    if (/^\s+$/.test(inputElement?.value ?? "")) {
      updateItem(undefined, true)
    } else if (inputElement?.value.includes("\n")) {
      const newActiveItem = focusedItem ?? currentSearch[0]
      updateItem(newActiveItem, true)
    }

    // scroll to top when typing
    if (
      !focusedItem &&
      "data" in e &&
      typeof e.data === "string" &&
      /^[\dA-Za-z]$/.test(e.data)
    )
      window.scrollTo({
        top: 0,
      })
  }

  /**
   * move up or down the list of search results and highlight the next item
   * wrap around to the top or bottom when you reach the end
   * @param direction which way to move the highlight
   */
  const move = (direction: "up" | "down") => {
    // an index of -1 means no item is selected
    const currentIndex = focusedItem ? currentSearch.indexOf(focusedItem) : -1
    let nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (nextIndex < -1) nextIndex = currentSearch.length - 1
    if (nextIndex >= currentSearch.length) nextIndex = -1

    const nextItem = currentSearch[nextIndex]
    setFocusedItem(nextItem)
    if (nextItem?.id !== location.id) updateItem(nextItem)

    // if the value is -1, restore the user's typed value, otherwise use the name of the item
    if (inputElement) {
      inputElement.value =
        nextIndex === -1 ? userTyped ?? "" : nextItem?.name ?? ""
    }
  }

  /**
   * handle key presses, i.e. arrow keys and escape
   * we don't check for enter here because mobile devices don't have enter,
   * so we check for a newline on input instead
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        move("up")

        break

      case "ArrowDown":
        e.preventDefault()
        move("down")

        break

      case "Escape":
      case "Tab":
        inputElement?.blur()
        updateItem(focusedItem ?? currentSearch[0], true)

        break
    }
  }

  const handleBlur = () =>
    setTimeout(
      () =>
        updateItem(
          // prefer the item selected by keyboard
          focusedItem ??
            // then prefer the first search result
            currentSearch[0] ??
            // if neither are set, maintain/clear the current value
            (inputElement && inputElement.value.length > 0
              ? activeItem
              : undefined),
          true,
        ),
      100,
    )

  /**
   * register event listeners for the events we need
   */
  useEventListener("input", handleInput, { target: inputElement })
  useEventListener("keydown", handleKeyDown, { target: inputElement })
  useEventListener("blur", handleBlur, { target: inputElement })

  return {
    focusedItem,
    currentSearch: userTyped ? currentSearch : undefined,
    selectItem: updateItemExternally,
  }
}
