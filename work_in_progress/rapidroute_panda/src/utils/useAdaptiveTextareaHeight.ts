import { type RefObject, useEffect } from "react"

/**
 * automatically update the size of the input box to fit the text
 */
export default function useAdaptiveTextareaHeight(
	textareaElement: RefObject<HTMLTextAreaElement | null>,
) {
	useEffect(() => {
		const textarea = textareaElement.current
		if (!textarea) return

		const updateSize = () => {
			if (textarea) {
				if (document.activeElement !== textarea)
					textarea.value = textarea.value.replaceAll("\n", "").trim()
				// measure height
				textarea.style.height = ""
				textarea.style.height = `${textarea.scrollHeight}px`
			}
		}

		updateSize()
		window.addEventListener("resize", updateSize)
		textarea?.addEventListener("input", updateSize)
		textarea?.addEventListener("change", updateSize)
		const interval = setInterval(updateSize, 100)
		return () => {
			window.removeEventListener("resize", updateSize)
			textarea?.removeEventListener("input", updateSize)
			textarea?.removeEventListener("change", updateSize)
			clearInterval(interval)
		}
	}, [textareaElement])
}