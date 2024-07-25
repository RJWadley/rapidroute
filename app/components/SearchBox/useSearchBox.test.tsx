import { afterEach, expect, test } from "bun:test"
import {
	act,
	cleanup,
	render,
	renderHook,
	screen,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useEffect } from "react"

import useSearchBox from "./useSearchBox"

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
		// biome-ignore lint/a11y/noAutofocus: part of the test
		<textarea autoFocus={autoFocus ?? true} placeholder="placeholder" />,
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
					// biome-ignore lint/a11y/noAutofocus: part of the test
					autoFocus={autoFocus ?? true}
					{...out.inputProps}
					placeholder="placeholder"
				/>,
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
	expect(document.activeElement === getInput()).toBeFalse()
})

test("autofocus works", async () => {
	runHook()
	expect(document.activeElement === getInput()).toBeTrue()
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
	expect(document.activeElement === getInput()).toBeTrue()

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
	expect(document.activeElement === getInput()).toBeTrue()
	expect(getInput().value).toBe("a")
	expect(selected).toBeUndefined()

	await user.keyboard("{tab}")
	result.current.onFocusLost()

	expect(document.activeElement === getInput()).toBeFalse()
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
	expect(document.activeElement === getInput()).toBeTrue()
	expect(getInput().value).toBe("a")
	expect(selected).toBeUndefined()

	await user.keyboard("{Enter}")
	result.current.onFocusLost()

	expect(document.activeElement === getInput()).toBeFalse()
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

	for (const el of document.querySelectorAll("*")) {
		if (el instanceof HTMLElement) {
			el.blur()
		}
	}

	expect(document.activeElement === getInput()).toBeFalse()
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
	expect(result.current.searchResults?.at(0)?.highlighted).toBeFalse()

	await user.keyboard("{arrowdown}")
	// textbox correct
	expect(result.current.inputProps.value).toBe("thing a")
	// first result highlighted
	expect(result.current.searchResults?.at(0)?.highlighted).toBeTrue()

	await user.keyboard("{arrowdown}")
	expect(result.current.inputProps.value).toBe("thing b")
	expect(result.current.searchResults?.at(1)?.highlighted).toBeTrue()

	// and back up
	await user.keyboard("{arrowup}")
	expect(result.current.inputProps.value).toBe("thing a")
	expect(result.current.searchResults?.at(0)?.highlighted).toBeTrue()

	await user.keyboard("{arrowup}")
	expect(result.current.inputProps.value).toBe("t")
	expect(result.current.searchResults?.at(0)?.highlighted).toBeFalse()
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
	expect(document.activeElement === getInput()).toBeFalse()
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

	act(() => {
		getInput().focus()
	})

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

	expect(document.activeElement === getInput()).toBeTrue()
	expect(result.current.searchResults).toBeUndefined()
	await user.keyboard("{Escape}")

	act(() => {
		/* happy dom doesn't fire this event, but real browsers do */
		result.current.inputProps.onFocus()
	})

	expect(document.activeElement === getInput()).toBeFalse()
	expect(result.current.searchResults).toBeUndefined()
})

test("after selecting with new line and refocusing, dropdown should be visible", async () => {
	const user = userEvent.setup()
	const result = runHook()

	await user.keyboard("t")
	await user.keyboard("\n")
	expect(result.current.inputProps.value).toBe("thing a")
	expect(result.current.searchResults).toBeUndefined()

	act(() => {
		getInput().focus()
	})

	expect(result.current.searchResults).not.toBeUndefined()
})

test("when clicked, dropdown should open even if already focused (in case of autofocus)", async () => {
	const user = userEvent.setup()
	const result = runHook()
	expect(result.current.searchResults).toBeUndefined()

	act(() => {
		getInput().click()
	})

	expect(result.current.searchResults).not.toBeUndefined()
})

test("after selecting with new line, value does not maintain new line", async () => {
	const user = userEvent.setup()
	const result = runHook()

	await user.keyboard(" t ")
	await user.keyboard("\n")
	expect(result.current.inputProps.value).toBe("thing a")

	act(() => {
		getInput().focus()
	})

	await user.keyboard("{arrowdown}{arrowup}{arrowup}")
	expect(result.current.inputProps.value).toBe("t")
})

test("when no results, pressing enter doesn't leave a new line, keeps input open, and input remains focused", async () => {
	const user = userEvent.setup()
	const result = runHook()

	await user.keyboard("blah blah blah")
	expect(result.current.searchResults?.length).toBe(0)

	await user.keyboard("{Enter}")

	expect(document.activeElement === getInput()).toBeTrue()
	expect(result.current.searchResults?.length).toBe(0)
	expect(result.current.inputProps.value).toBe("blah blah blah")
})

test("pressing enter with no text leaves input empty", async () => {
	const user = userEvent.setup()
	const result = runHook()

	await user.keyboard("{Enter}{Enter}{Enter}")

	expect(result.current.inputProps.value).toBe("")
})

test("if we completely clear the input and press escape, the input should be empty and no selection", async () => {
	const user = userEvent.setup()
	let selected: string | undefined
	const result = runHook({
		onItemSelected: (item) => {
			selected = item?.id ?? undefined
		},
	})

	// first, select a location
	await user.keyboard("t")
	await user.keyboard("{arrowdown}")
	await user.keyboard("{arrowdown}")
	expect(result.current.inputProps.value).toBe("thing b")
	expect(selected).toBe("b")

	// then, clear the input
	await user.keyboard(
		"{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}",
	)
	expect(result.current.inputProps.value).toBe("")
	expect(selected).toBeUndefined()

	// then, press escape
	await user.keyboard("{Escape}")
	expect(result.current.inputProps.value).toBe("")
	expect(selected).toBeUndefined()
})

test("typing should not unselect a selected place", async () => {
	const user = userEvent.setup()
	let selected: string | undefined
	const result = runHook({
		onItemSelected: (item) => {
			selected = item?.id ?? undefined
		},
	})

	await user.keyboard("t{Enter}")
	expect(selected).toBe("a")
	await user.keyboard("t")

	await act(async () => {
		getInput().focus()
	})
	await user.keyboard("{backspace}blah blah blah")
	expect(result.current.inputProps.value).toBe("thing blah blah blah")
	expect(selected).toBe("a")
})