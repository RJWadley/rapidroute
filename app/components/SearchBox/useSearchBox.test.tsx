import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react"

import { test, expect, afterEach } from "bun:test"
import userEvent from "@testing-library/user-event"
import useSearchBox from "./useSearchBox"
import { useEffect } from "react"
import { userInfo } from "os"

const placesShim = [
  { id: "a", name: "thing a" },
  { id: "b", name: "thing b" },
  { id: "c", name: "thing c" },
]

type Options = Partial<Parameters<typeof useSearchBox>[0]> & {
  autoFocus?: boolean
}

function runHook(options?: Options) {
  const { onItemSelected, autoFocus, initiallySelectedPlace, initialPlaces } =
    options ?? {}

  const { rerender } = render(
    <textarea autoFocus={autoFocus ?? true} placeholder="placeholder" />
  )

  const { result } = renderHook(() => {
    const out = useSearchBox({
      initialPlaces: initialPlaces ?? placesShim,
      onItemSelected,
      initiallySelectedPlace,
    })

    useEffect(() => {
      rerender(
        <textarea
          autoFocus={autoFocus ?? true}
          {...out.inputProps}
          placeholder="placeholder"
        />
      )
    }, [out])

    return out
  })

  return result
}

const getInput = () =>
  screen.getByPlaceholderText("placeholder") as HTMLTextAreaElement

afterEach(() => {
  cleanup()
})

test("not focused without autoFocus prop", () => {
  runHook({ autoFocus: false })
  expect(document.activeElement).not.toBe(getInput())
})

test("autofocus works", async () => {
  runHook()
  expect(document.activeElement).toBe(getInput())
})

test("basic search works", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("b")
  expect(getInput().value).toBe("b")
  expect(result.current.searchResults?.at(0)?.id).toBe("b")

  await user.keyboard("{backspace}a")
  expect(getInput().value).toBe("a")
  expect(result.current.searchResults?.at(0)?.id).toBe("a")
})

test("no search results shown before first keypress", async () => {
  const user = userEvent.setup()
  const result = runHook()

  // expect focused
  expect(document.activeElement).toBe(getInput())

  // expect no results
  expect(result.current.searchResults).toBeUndefined()

  await user.keyboard("a{backspace}")

  // expect results
  expect(result.current.searchResults?.length).not.toBe(0)
})

test("search results are displayed after first keypress", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("a")
  expect(result.current.searchResults?.length).not.toBe(0)
})

test("typing then pressing tab moves on without selecting or changing input value", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("a")
  expect(document.activeElement).toBe(getInput())
  expect(getInput().value).toBe("a")
  expect(selected).toBeUndefined()

  await user.keyboard("{tab}")
  result.current.onFocusLost()

  expect(document.activeElement).not.toBe(getInput())
  expect(selected).toBeUndefined()
  expect(result.current.searchResults).toBeUndefined()
  expect(getInput().value).toBe("a")
})

test("typing then pressing enter selects the first result", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("a")
  expect(document.activeElement).toBe(getInput())
  expect(getInput().value).toBe("a")
  expect(selected).toBeUndefined()

  await user.keyboard("{Enter}")
  result.current.onFocusLost()

  expect(document.activeElement).not.toBe(getInput())
  expect(selected).toBe("a")
  expect(result.current.inputProps.value).toBe("thing a")
})

test("typing, then arrow keys, then tab leaves place name in input and selects", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("t")
  expect(result.current.inputProps.value).toBe("t")

  await user.keyboard("{arrowdown}")
  expect(result.current.inputProps.value).toBe("thing a")

  await user.keyboard("{tab}")
  result.current.onFocusLost()

  expect(selected).toBe("a")
  expect(result.current.inputProps.value).toBe("thing a")
})

test("typing, then arrow keys, then enter selects the highlighted result", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("t")
  expect(result.current.inputProps.value).toBe("t")

  await user.keyboard("{arrowdown}")
  expect(result.current.inputProps.value).toBe("thing a")

  await user.keyboard("{Enter}")
  result.current.onFocusLost()

  expect(selected).toBe("a")
  expect(result.current.inputProps.value).toBe("thing a")
})

test("results remain open when the whole document loses focus", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("a")
  expect(result.current.searchResults?.length).not.toBe(0)

  document
    .querySelectorAll("*")
    .forEach((el) => el instanceof HTMLElement && el.blur())

  expect(document.activeElement).not.toBe(getInput())
  expect(result.current.searchResults?.length).not.toBe(0)
  expect(result.current.searchResults?.length).not.toBeUndefined()
})

test("up and down arrow keys move through results and update input value", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("t")
  // has results
  expect(result.current.searchResults?.length).toBe(3)
  // textbox correct
  expect(result.current.inputProps.value).toBe("t")
  // first result exists
  expect(result.current.searchResults?.at(0)?.id).toBe("a")
  // first result not highlighted
  expect(result.current.searchResults?.at(0)?.highlighted).toBe(false)

  await user.keyboard("{arrowdown}")
  // textbox correct
  expect(result.current.inputProps.value).toBe("thing a")
  // first result highlighted
  expect(result.current.searchResults?.at(0)?.highlighted).toBe(true)

  await user.keyboard("{arrowdown}")
  expect(result.current.inputProps.value).toBe("thing b")
  expect(result.current.searchResults?.at(1)?.highlighted).toBe(true)

  // and back up
  await user.keyboard("{arrowup}")
  expect(result.current.inputProps.value).toBe("thing a")
  expect(result.current.searchResults?.at(0)?.highlighted).toBe(true)

  await user.keyboard("{arrowup}")
  expect(result.current.inputProps.value).toBe("t")
  expect(result.current.searchResults?.at(0)?.highlighted).toBe(false)
})

test("before typing, arrow keys do nothing", async () => {
  const user = userEvent.setup()
  const result = runHook()

  expect(result.current.inputProps.value).toBeFalsy()

  await user.keyboard("{arrowdown}")
  // no results and input empty
  expect(result.current.searchResults).toBeUndefined()
  expect(result.current.inputProps.value).toBeFalsy()

  await user.keyboard("{arrowup}")
  expect(result.current.searchResults).toBeUndefined()
  expect(result.current.inputProps.value).toBeFalsy()
})

test("no results works as expected", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("blah blah blah")
  // should be defined, but not have any results
  expect(result.current.searchResults?.length).toBe(0)
})

test("arrow keys wrap around and restore typed value", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("t")
  expect(result.current.inputProps.value).toBe("t")

  await user.keyboard("{arrowup}")
  expect(result.current.inputProps.value).toBe("thing c")

  await user.keyboard("{arrowup}")
  await user.keyboard("{arrowup}")
  expect(result.current.inputProps.value).toBe("thing a")

  await user.keyboard("{arrowup}")
  expect(result.current.inputProps.value).toBe("t")

  await user.keyboard("{arrowdown}")
  await user.keyboard("{arrowdown}")
  await user.keyboard("{arrowdown}")
  expect(result.current.inputProps.value).toBe("thing c")

  await user.keyboard("{arrowdown}")
  expect(result.current.inputProps.value).toBe("t")

  await user.keyboard("{arrowdown}")
  expect(result.current.inputProps.value).toBe("thing a")
})

test("escape closes the dropdown and does not select", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  expect(result.current.searchResults).toBeUndefined()
  await user.keyboard("t")
  expect(result.current.searchResults).not.toBeUndefined()

  await user.keyboard("{Escape}")
  expect(result.current.searchResults).toBeUndefined()
  expect(selected).toBeUndefined()

  // and not focused
  expect(document.activeElement).not.toBe(getInput())
})

test("arrow keys, then escape closes the dropdown, leaves text in input, and selects", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("t")
  await user.keyboard("{arrowdown}")
  await user.keyboard("{arrowdown}")
  await user.keyboard("{arrowdown}")
  await user.keyboard("{Escape}")

  expect(result.current.searchResults).toBeUndefined()
  expect(selected).toBe("c")
  expect(result.current.inputProps.value).toBe("thing c")
})

test("clicking a result selects it", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("t")
  expect(result.current.searchResults?.length).not.toBe(0)

  act(() => {
    getInput().blur()
    // select thing b
    result.current.searchResults?.at(1)?.selectItem()
  })

  expect(selected).toBe("b")
  expect(result.current.inputProps.value).toBe("thing b")
})

test("clicking a result then typing uses the new text value from that result", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("t")
  expect(result.current.searchResults?.length).not.toBe(0)

  act(() => {
    getInput().blur()
    // select thing b
    result.current.searchResults?.at(1)?.selectItem()
  })

  expect(selected).toBe("b")
  expect(result.current.inputProps.value).toBe("thing b")

  getInput().focus()
  await user.keyboard("a")
  expect(result.current.inputProps.value).toBe("thing ba")
})

test("typing a new line is treated as an enter", async () => {
  const user = userEvent.setup()
  let selected: string | undefined
  const result = runHook({
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  await user.keyboard("t")
  expect(result.current.searchResults?.length).not.toBe(0)

  expect(selected).toBeUndefined()
  await user.keyboard("\n")
  expect(selected).toBe("a")
})

test("initially selected place is reflected in input", async () => {
  const result = runHook({ initiallySelectedPlace: placesShim[1] })

  expect(result.current.inputProps.value).toBe("thing b")
  // dropdown closed though
  expect(result.current.searchResults).toBeUndefined()
})

test("initially selected place does not immediately fire onItemSelected", async () => {
  let selected: string | undefined
  const result = runHook({
    initiallySelectedPlace: placesShim[1],
    onItemSelected: (item) => {
      selected = item?.id ?? undefined
    },
  })

  expect(selected).toBeUndefined()
})

test("spaces at end of input are preserved (not trimmed)", async () => {
  const user = userEvent.setup()
  const result = runHook()

  await user.keyboard("thing ")
  expect(result.current.inputProps.value).toBe("thing ")
})

test("pressing escape immediately after load blurs the input and keeps the dropdown closed", async () => {
  const user = userEvent.setup()
  const result = runHook()

  expect(document.activeElement).toBe(getInput())
  expect(result.current.searchResults).toBeUndefined()
  await user.keyboard("{Escape}")
  expect(document.activeElement).not.toBe(getInput())
  expect(result.current.searchResults).toBeUndefined()
})
