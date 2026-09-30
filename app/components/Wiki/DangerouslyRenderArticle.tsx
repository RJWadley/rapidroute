import { dynamicColor, theme } from "app/utils/theme"
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
	"*": { userSelect: "text" },
	"p, ul, ol": { marginBottom: "0.8em" },
	img: { maxWidth: "100%", height: "auto" },
	".thumb, .thumbinner": {
		maxWidth: "100%",
		float: "none",
	},
	".hatnote": {
		padding: 10,
		background: theme.cardHover,
		borderRadius: 8,
		fontSize: 12,
		marginBottom: 12,
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
