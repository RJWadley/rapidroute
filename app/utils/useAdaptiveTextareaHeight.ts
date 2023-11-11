import { useEffect } from "react"

/**
 * automatically update the size of the input box to fit the text
 */
export default function useAdaptiveTextareaHeight(
  textareaElement: HTMLTextAreaElement | null,
) {
  const textarea = textareaElement
  useEffect(() => {
    const updateSize = () => {
      if (textarea) {
        // calculate the height of the input box
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
  }, [textarea])
}
