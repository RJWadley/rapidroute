import invertLightness from "app/utils/color"
import { dynamicColor } from "app/utils/theme"
import { parseToHsla } from "color2k"
import { memo } from "react"
import { styled } from "restyle"

/**
 * dangerously render HTML
 *
 * this is a separate component so that it can be memoized
 * separately from other stuff, which means it doesn't need to
 * re-render when other props or context change
 *
 * if we didn't do this, we'd have to destroy and recreate the
 * entire article content any time any context changed, which is
 * slow and breaks text selection
 */
function DangerouslyRenderArticle({
	content,
}: {
	content: string
}) {
	return (
		<ArticleContent
			// biome-ignore lint/security/noDangerouslySetInnerHtml: comes from wiki content, thus safe in theory
			dangerouslySetInnerHTML={{
				__html: content,
			}}
			// we never want to preserve the content when we re-render
			key={Math.random()}
			ref={(article) => {
				if (!article) return
				const elementsWithBackground = article.querySelectorAll(
					'*[style*="background-color:"], *[style*="background:"]',
				)
				const elementsWithColor = article.querySelectorAll('*[style*="color:"]')

				const cleanups: VoidFunction[] = []

				/**
				 * remove set color from all elements
				 */
				for (const element of elementsWithColor) {
					if (element instanceof HTMLElement) {
						const originalColor = element.style.color
						cleanups.push(() => {
							element.style.color = originalColor
						})
						element.style.removeProperty("color")
					}
				}

				/**
				 * update background colors to include a set text color
				 */
				for (const element of elementsWithBackground) {
					if (element instanceof HTMLElement) {
						const originalBackground = element.style.backgroundColor
						const originalColor = element.style.color
						cleanups.push(() => {
							element.style.backgroundColor = originalBackground
							element.style.color = originalColor
						})

						element.style.colorScheme = "light" // ensure our computed color matches the wiki
						const computedBackground =
							window.getComputedStyle(element).backgroundColor
						element.style.removeProperty("color-scheme")
						const [hue, saturation, lightness] = parseToHsla(computedBackground)
						const colorIsLight = lightness > 0.5

						const dynamic = dynamicColor(computedBackground)

						element.style.backgroundColor = colorIsLight
							? dynamic.backgroundColor
							: dynamic.color
						element.style.color = colorIsLight
							? dynamic.color
							: dynamic.backgroundColor
					}
				}

				/**
				 * add images
				 */
				const lazyImages = article.querySelectorAll<HTMLSpanElement>(
					"span.lazy-image-placeholder",
				)
				for (const image of lazyImages) {
					const newImage = document.createElement("img")

					const src = image.dataset.mwSrc
					const width = image.dataset.mwWidth
					const height = image.dataset.mwHeight
					const srcset = image.dataset.mwSrcset

					// image.replaceWith(newImage)
				}

				return () => {
					for (const cleanup of cleanups) {
						cleanup()
					}
				}
			}}
		/>
	)
}

export default memo(DangerouslyRenderArticle)

const ArticleContent = styled("div", {
	// hide disambiguation links
	".hatnote": {
		border: "1px solid red",
	},

	// hide table of contents
	"#toc": {
		display: "none",
	},

	// hide edit buttons
	".mw-editsection": {
		display: "none",
	},

	// restore margins on headings
	"h1, h2, h3, h4, h5, h6": {
		marginTop: "0.5em",
		marginBottom: "0.25em",
	},

	// make lazy images display
	".gen-image": {
		display: "block",
		width: "100%",
		height: "auto",
	},
})
