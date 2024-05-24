"use client"

import type { Place } from "@prisma/client"
import useSearchBox from "./useSearchBox"
import { getTextboxName } from "./getTextboxName"
import { useRef } from "react"
import useAdaptiveTextareaHeight from "~/utils/useAdaptiveTextareaHeight"
import { useClickAway, useKeyPress } from "ahooks"

export default function SearchBox({ places }: { places: Place[] }) {
	const wrapper = useRef<HTMLDivElement>(null)
	const input = useRef<HTMLTextAreaElement>(null)

	const { inputProps, searchResults, onFocusLost } = useSearchBox({
		initialPlaces: places,
	})

	useAdaptiveTextareaHeight(input)
	useClickAway(onFocusLost, wrapper)
	useKeyPress("ctrl.k", () => input.current?.focus())
	useKeyPress("meta.k", () => input.current?.focus())

	return (
		<div ref={wrapper}>
			<textarea {...inputProps} />
			{searchResults ? (
				<ul>
					{searchResults.length === 0 ? "No Results" : null}
					{searchResults.map((suggestion) => (
						<button
							type="button"
							key={suggestion.id}
							onClick={() => suggestion.selectItem()}
							style={{
								color: suggestion.highlighted ? "red" : "black",
							}}
						>
							<span>{getTextboxName(suggestion)}</span>
						</button>
					))}
				</ul>
			) : null}
		</div>
	)
}
