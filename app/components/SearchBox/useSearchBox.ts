import type { CompressedPlace } from "app/utils/compressedPlaces"
import { useSearchResults } from "app/utils/useSearchResults"
import type { ComponentProps, FocusEvent } from "react"
import { useRef, useState } from "react"
import { getTextboxName } from "./getTextboxName"

const blurActiveElement = () => {
	if (document.activeElement instanceof HTMLElement)
		document.activeElement.blur()
}

/**
 * This list will handle up and down arrow keys to navigate a list of items,
 * for example, you have a list of results and want the user to be able to
 * navigate the list with the arrow keys.
 */
export default function useSearchBox<T extends Partial<CompressedPlace>>({
	initialPlaces,
	initiallySelectedPlace,
	onItemSelected,
	onBlur: blurCallback,
}: {
	/**
	 * the initial list of all places to search through
	 */
	initialPlaces: T[]
	/**
	 * which place is initially selected (via search params)?
	 */
	initiallySelectedPlace?: T
	/**
	 * a callback when the selected place changes
	 */
	onItemSelected?: (item: T | undefined, explicitly: boolean) => void
	/**
	 * called after an item is selected and the input is blurred
	 */
	onBlur?: () => void
}) {
	/**
	 * the currently selected item in the list
	 * (or undefined if no item selected)
	 */
	const [selectedPlace, setSelectedPlace] = useState<T | undefined>(
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

	const selectPlace = (place: T | undefined, explicitly: boolean) => {
		setSelectedPlace(place)
		onItemSelected?.(place, explicitly)
	}

	const currentIndex = selectedPlace ? currentSearch.indexOf(selectedPlace) : -1

	const move = (direction: "up" | "down") => {
		// if not open, skip
		if (!isOpen) return

		let nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

		// if we're before the first item, go to the end
		if (nextIndex < -1) nextIndex = currentSearch.length - 1
		// if we're after the last item, go to the start
		if (nextIndex >= currentSearch.length) nextIndex = -1
		const nextItem = currentSearch[nextIndex]
		selectPlace(nextItem, false)
	}

	const boxText =
		currentIndex === -1 ? userTyped : getTextboxName(selectedPlace).trim()

	/**
	 * if autofocus is true, browsers will fire focus then blur
	 * so we need to account for that
	 */
	const firstFocus = useRef(true)

	return {
		onFocusLost: () => {
			if (document.hasFocus()) setIsOpen(false)
		},
		searchResults: isOpen
			? currentSearch.map((item) => ({
					...item,
					selectItem: () => {
						setIsOpen(false)
						selectPlace(item, true)
					},
					highlighted: selectedPlace?.id === item.id,
				}))
			: undefined,
		inputProps: {
			value: isOpen || !selectedPlace ? boxText : getTextboxName(selectedPlace),
			onFocus: (e?: FocusEvent<HTMLTextAreaElement>) => {
				const input = e?.currentTarget
				if (!input) return

				if (input.autofocus && firstFocus.current) {
					firstFocus.current = false
					return
				}
				setIsOpen(true)
			},
			onClick: (e) => {
				e.currentTarget.select()
				setIsOpen(true)
			},
			onInput: (e) => {
				const newValue = e.currentTarget.value
				setUserTyped(newValue)
				setSelectedPlace(undefined)
				setIsOpen(true)

				if (newValue.trim() === "") {
					selectPlace(undefined, false)
					setUserTyped("")
				} else if (newValue.includes("\n") && currentSearch.length > 0) {
					const newActiveItem = selectedPlace ?? currentSearch[0]
					selectPlace(newActiveItem, true)
					setIsOpen(false)
					setUserTyped(newValue.trim())
					blurActiveElement()
					blurCallback?.()
				} else if (newValue.includes("\n")) {
					setUserTyped(newValue.trim())
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
						blurActiveElement()

						// needed in some browsers as well (for initial interaction)
						e.currentTarget.blur()

						break
				}
			},

			// disable spellcheck, auto correct, and autocapitalize, grammarly, etc.
			spellCheck: false,
			autoCorrect: "off",
			autoCapitalize: "off",
			autoComplete: "off",
			"data-gramm": false,
			"data-gramm_editor": false,
			"data-enable-grammarly": false,
		},
		clear: () => {
			// reset all state
			setUserTyped("")
			setIsOpen(false)
			selectPlace(undefined, true)
		},
	} satisfies {
		/**
		 * the current search results, or undefined if the suggestions dropdown is not visible
		 */
		searchResults:
			| (T & { selectItem: VoidFunction; highlighted: boolean })[]
			| undefined
		/**
		 * props to be passed to the text area for event handling
		 */
		inputProps: Partial<ComponentProps<"textarea">> &
			Record<`data-${string}`, boolean>
		/**
		 * a function for the parent, to call when a common ancestor of the text area and the results loses focus
		 * (it can't be the input itself, because then we'd lose focus when clicking on a result)
		 */
		onFocusLost: VoidFunction
		/**
		 * clear this search box
		 */
		clear: () => void
	}
}
