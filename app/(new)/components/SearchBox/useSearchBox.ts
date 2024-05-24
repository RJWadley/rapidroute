import { useSearchResults } from "temp/data/search";
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Place } from "@prisma/client";
import { emulateTab } from "emulate-tab";
import type { ComponentProps, FocusEvent } from "react";
import { useRef, useState } from "react";

import { getTextboxName } from "./getTextboxName";

const tryTab = () => {
	try {
		emulateTab();
	} catch (error) {
		if (document.activeElement instanceof HTMLElement)
			document.activeElement.blur();
	}
};

/**
 * This list will handle up and down arrow keys to navigate a list of items,
 * for example, you have a list of results and want the user to be able to
 * navigate the list with the arrow keys.
 */
export default function useSearchBox<T extends Partial<Place>>({
	initialPlaces,
	initiallySelectedPlace,
	onItemSelected,
}: {
	/**
	 * the initial list of all places to search through
	 */
	initialPlaces: T[];
	/**
	 * which place is initially selected (via search params)?
	 */
	initiallySelectedPlace?: T;
	/**
	 * a callback when the selected place changes
	 */
	onItemSelected?: (item: T | undefined) => void;
}) {
	/**
	 * the currently selected item in the list
	 * (or undefined if no item selected)
	 */
	const [selectedPlace, setSelectedPlace] = useState<T | undefined>(
		initiallySelectedPlace,
	);
	/**
	 * what the user has physically typed into the input
	 */
	const [userTyped, setUserTyped] = useState<string>();
	/**
	 * current search results, based on the userTyped
	 */
	const currentSearch = useSearchResults(userTyped, initialPlaces);
	/**
	 * track if the dropdown should be open or closed
	 */
	const [isOpen, setIsOpen] = useState(false);

	const selectPlace = (place: T | undefined) => {
		setSelectedPlace(place);
		onItemSelected?.(place);
	};

	const currentIndex = selectedPlace
		? currentSearch.indexOf(selectedPlace)
		: -1;

	const move = (direction: "up" | "down") => {
		// if not open, skip
		if (!isOpen) return;

		let nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

		// if we're before the first item, go to the end
		if (nextIndex < -1) nextIndex = currentSearch.length - 1;
		// if we're after the last item, go to the start
		if (nextIndex >= currentSearch.length) nextIndex = -1;
		const nextItem = currentSearch[nextIndex];
		selectPlace(nextItem);
	};

	const boxText =
		currentIndex === -1 ? userTyped : getTextboxName(selectedPlace).trim();

	/**
	 * if autofocus is true, browsers will fire focus then blur
	 * so we need to account for that
	 */
	const firstFocus = useRef(true);

	return {
		onFocusLost: () => {
			if (document.hasFocus()) setIsOpen(false);
		},
		searchResults: isOpen
			? currentSearch.map((item) => ({
					...item,
					selectItem: () => {
						setIsOpen(false);
						selectPlace(item);
					},
					highlighted: selectedPlace?.id === item.id,
				}))
			: undefined,
		inputProps: {
			value: isOpen || !selectedPlace ? boxText : getTextboxName(selectedPlace),
			onFocus: (e?: FocusEvent<HTMLTextAreaElement>) => {
				const input = e?.currentTarget;
				if (!input) return;

				if (input.autofocus && firstFocus.current) {
					firstFocus.current = false;
					return;
				}
				setIsOpen(true);
			},
			onClick: (e) => {
				e.currentTarget.select();
				setIsOpen(true);
			},
			onInput: (e) => {
				const newValue = e.currentTarget.value;
				setUserTyped(newValue);
				setSelectedPlace(undefined);
				setIsOpen(true);

				if (/^\s+$/.test(newValue)) {
					selectPlace(undefined);
				} else if (newValue.includes("\n") && currentSearch.length > 0) {
					const newActiveItem = selectedPlace ?? currentSearch[0];
					selectPlace(newActiveItem);
					setIsOpen(false);
					setUserTyped(newValue.trim());
					tryTab();
				} else if (newValue.includes("\n")) {
					setUserTyped(newValue.trim());
				}
			},
			onKeyDown: (e) => {
				switch (e.key) {
					case "ArrowUp":
						e.preventDefault();
						move("up");

						break;

					case "ArrowDown":
						e.preventDefault();
						move("down");

						break;

					case "Tab":
						setIsOpen(false);
						break;

					case "Escape":
						e.preventDefault();
						setIsOpen(false);
						tryTab();

						// needed in some browsers as well (for initial interaction)
						e.currentTarget.blur();

						break;
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
	} satisfies {
		/**
		 * the current search results, or undefined if the suggestions dropdown is not visible
		 */
		searchResults:
			| (T & { selectItem: VoidFunction; highlighted: boolean })[]
			| undefined;
		/**
		 * props to be passed to the text area for event handling
		 */
		inputProps: Partial<ComponentProps<"textarea">> &
			Record<`data-${string}`, boolean>;
		/**
		 * a function for the parent, to call when a common ancestor of the text area and the results loses focus
		 * (it can't be the input itself, because then we'd lose focus when clicking on a result)
		 */
		onFocusLost: VoidFunction;
	};
}
