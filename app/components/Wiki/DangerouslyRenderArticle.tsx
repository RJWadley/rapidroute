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

						const originalColorScheme = element.style.colorScheme
						element.style.colorScheme = "light" // ensure our computed color matches the wiki
						const computedBackground =
							window.getComputedStyle(element).backgroundColor
						element.style.colorScheme = originalColorScheme
						const [, , lightness, alpha] = parseToHsla(computedBackground)
						// Transparent wiki headings must inherit readable text, rather
						// than deriving an equally transparent foreground color.
						if (alpha === 0) continue
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

				for (const table of article.querySelectorAll("table")) {
					if (
						table.matches(".infobox") ||
						table.parentElement?.closest("table")
					)
						continue
					const wrapper = document.createElement("div")
					wrapper.className = "wiki-table-scroll"
					wrapper.tabIndex = 0
					wrapper.setAttribute("role", "region")
					wrapper.setAttribute(
						"aria-label",
						table.caption?.textContent?.trim() || "Article table",
					)
					table.before(wrapper)
					wrapper.append(table)
					cleanups.push(() => wrapper.replaceWith(table))
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
	ul: { paddingLeft: "1.4em", listStyleType: "disc" },
	ol: { paddingLeft: "1.4em", listStyleType: "decimal" },
	li: { marginBottom: "0.25em" },
	a: { textUnderlineOffset: "2px" },
	img: { maxWidth: "100%", height: "auto" },
	".thumb, .thumbinner": {
		maxWidth: "100%",
		float: "none",
	},
	".thumb, figure": { margin: "16px 0" },
	".thumbcaption, figcaption": {
		marginTop: 6,
		fontSize: 11,
		lineHeight: 1.5,
		color: theme.cardTextMuted,
	},
	".infobox": {
		width: "100% !important",
		minWidth: 0,
		float: "none",
		margin: "18px 0 24px",
		border: `1px solid ${theme.cardActive}`,
		borderRadius: 10,
		borderSpacing: 0,
		tableLayout: "fixed",
		fontSize: 12,
		lineHeight: 1.6,
	},
	".infobox th, .infobox td": { padding: "6px 10px", verticalAlign: "top" },
	".infobox-label": { width: "35%", textAlign: "left", fontWeight: 600 },
	".infobox-above": { fontSize: 16, textAlign: "left", paddingTop: 12 },
	".infobox-header": { textAlign: "left", paddingTop: 14, fontWeight: 600 },
	".wiki-table-scroll": {
		maxWidth: "100%",
		overflowX: "auto",
		margin: "16px 0",
		border: `1px solid ${theme.cardActive}`,
		borderRadius: 10,
	},
	".wiki-table-scroll:focus-visible": {
		outline: `2px solid ${theme.controlHeadingText}`,
		outlineOffset: 3,
	},
	".wiki-table-scroll > table": {
		width: "100%",
		borderCollapse: "collapse",
		fontSize: 12,
	},
	".wiki-table-scroll th, .wiki-table-scroll td": {
		padding: "8px 10px",
		minWidth: 90,
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
		marginTop: "1.25em",
		marginBottom: "0.5em",
		lineHeight: 1.3,
	},
	h2: { fontSize: 18 },
	h3: { fontSize: 16 },

	// make lazy images display
	".gen-image": {
		display: "inline-block",
		maxWidth: "100%",
		height: "auto",
		verticalAlign: "middle",
	},
})
