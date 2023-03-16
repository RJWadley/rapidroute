import { useCallback, useContext, useEffect, useState } from "react"

import { MapSearchContext } from "components/Providers/MapSearchContext"
import { getTextboxName, useSearch } from "data/search"

/**
 * This list will handle up and down arrow keys to navigate a list of items,
 * for example, you have a list of results and want the user to be able to
 * navigate the list with the arrow keys.
 */
export default function useListArrowKeys(
  inputElement: HTMLTextAreaElement | null
) {
  const input = inputElement
  const [focusedItem, setFocusedItem] = useState<string>()
  const [userTyped, setUserTyped] = useState<string>()
  const currentSearch = useSearch(userTyped)
  const { setActiveItem } = useContext(MapSearchContext)

  const selectAndClose = useCallback(
    (newItem: string | undefined) => {
      setUserTyped(undefined)
      if (input) {
        input.value = newItem ? getTextboxName(newItem) : ""
        input.blur()
      }
      setActiveItem(newItem ?? "")
    },
    [input, setActiveItem]
  )

  /**
   * update userTyped when the input is typed in
   * handle selection when the user presses enter
   */
  useEffect(() => {
    if (!input) return

    const handleInput = () => {
      setUserTyped(input.value)
      setFocusedItem(undefined)

      if (input?.value.match(/^\s+$/)) {
        selectAndClose(undefined)
      } else if (input?.value.includes("\n")) {
        const newActiveItem = focusedItem ?? currentSearch[0]
        selectAndClose(newActiveItem)
      }
    }

    input.addEventListener("input", handleInput)
    return () => {
      input.removeEventListener("input", handleInput)
    }
  }, [currentSearch, focusedItem, input, selectAndClose])

  /**
   * handle the up and down arrow keys to navigate the list
   */
  useEffect(() => {
    const move = (direction: "up" | "down") => {
      const currentIndex = focusedItem ? currentSearch.indexOf(focusedItem) : -1
      let nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

      if (nextIndex < -1) nextIndex = currentSearch.length - 1
      if (nextIndex >= currentSearch.length) nextIndex = -1
      const nextItem = currentSearch[nextIndex]
      setFocusedItem(nextItem)
      setActiveItem(nextItem)

      if (input) {
        input.value =
          nextIndex === -1 ? userTyped ?? "" : getTextboxName(nextItem)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        move("up")
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        move("down")
      }
      if (e.key === "Escape") {
        e.preventDefault()
        input?.blur()
        setUserTyped(undefined)
      }
    }

    input?.addEventListener("keydown", handleKeyDown)
    return () => {
      input?.removeEventListener("keydown", handleKeyDown)
    }
  })

  const updateItemExternally = (item: string) => {
    if (input) {
      input.value = getTextboxName(item)
      setUserTyped(undefined)
    }
  }

  return {
    focusedItem,
    currentSearch: userTyped ? currentSearch : undefined,
    selectItem: updateItemExternally,
  }
}
