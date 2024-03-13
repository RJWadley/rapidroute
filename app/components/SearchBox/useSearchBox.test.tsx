import { cleanup, render, renderHook, screen } from "@testing-library/react"

import { test, expect, afterEach } from "bun:test"
import userEvent from "@testing-library/user-event"
import useSearchBox from "./useSearchBox"

const placesShim = [
  { id: "a", name: "thing a" },
  { id: "b", name: "thing a" },
  { id: "c", name: "thing a" },
]

type Options = Partial<Parameters<typeof useSearchBox>[0]> & {
  autoFocus?: boolean
}

function runHook(options?: Options) {
  const { onItemSelected, autoFocus, initiallySelectedPlace, initialPlaces } =
    options ?? {}

  const { result } = renderHook(() =>
    useSearchBox({
      initialPlaces: initialPlaces ?? placesShim,
      onItemSelected,
      initiallySelectedPlace,
    })
  )

  render(
    <textarea
      autoFocus={autoFocus ?? true}
      {...result.current.inputProps}
      placeholder="placeholder"
    />
  )

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

// TODO test stubs
test("up and down arrow keys move through results and update input value", async () => {})
test("before typing, arrow keys do nothing", async () => {})
test("typing, then arrow keys, then tab leaves text in input and does not select", async () => {})
test("typing, then arrow keys, then enter selects the highlighted result", async () => {})
test("no results works as expected", async () => {})
test("arrow keys wrap around", async () => {})
test("arrow keys restore user text when wrapping around", async () => {})
test("escape closes the dropdown and does not select", async () => {})
test("arrow keys, then escape closes the dropdown, leaves text in input, and does not select", async () => {})
test("right or left arrow keys restore user text and un-highlight dropdown results", async () => {})
test("clicking a result selects it", async () => {})
test("clicking a result updates the input value", async () => {})
test("clicking a result then typing uses the new text value from that result", async () => {})
test("typing a new line is treated as an enter", async () => {})
