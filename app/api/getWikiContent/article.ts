import "server-only"
import { curatedWikiArticles } from "app/data/wikiArticles"
import { load } from "cheerio"
import type { WikiContext } from "./input"
import type { WikiContent } from "./types"
import { WikiResearch } from "./wiki"

const WIKI_ORIGIN = "https://wiki.minecartrapidtransit.net"

/** Only dataset links to the MRT wiki can supplement the manual curation list. */
function titleFromWikiLink(link?: string) {
	if (!link) return null
	try {
		const url = new URL(link)
		if (url.origin !== WIKI_ORIGIN || url.username || url.password) return null
		const title = url.pathname.startsWith("/index.php/")
			? decodeURIComponent(url.pathname.slice("/index.php/".length))
			: url.pathname === "/index.php"
				? url.searchParams.get("title")
				: null
		return title?.replaceAll("_", " ").trim() || null
	} catch {
		return null
	}
}

/** Copy lead paragraphs, excluding infoboxes, notices, captions and sections. */
function introduction(content: string) {
	const $ = load(content, null, false)
	const body = $(".mw-parser-output").first()
	const children = body.length ? body.children() : $.root().children()
	const paragraphs: string[] = []
	for (const element of children.toArray()) {
		const node = $(element)
		if (
			/^h[1-6]$/.test(element.tagName) ||
			node.hasClass("mw-heading") ||
			node.is("#toc, .toc")
		)
			break
		if (element.tagName !== "p") continue
		const paragraph = node.clone()
		paragraph.find("sup.reference, script, style, .mw-editsection").remove()
		const text = paragraph.text().replace(/\s+/g, " ").trim()
		if (!text) continue
		if (paragraphs.length && [...paragraphs, text].join("\n\n").length > 700)
			break
		paragraphs.push(
			text.length > 1000
				? `${text.slice(0, 1000).replace(/\s+\S*$/, "")}…`
				: text,
		)
		if (paragraphs.length === 2) break
	}
	return paragraphs.join("\n\n") || null
}

/** Original wiki reader: curated links take priority over ordinary wiki search. */
export async function getWikiArticle(
	name: string,
	context?: WikiContext,
	catalogLink?: string,
): Promise<WikiContent | null> {
	const id = context?.id ?? name.replaceAll(" ", "+").replaceAll("/", "--")
	const curated = curatedWikiArticles.get(id)
	if (curated?.world && context?.world && curated.world !== context.world)
		return null
	const title = curated?.article ?? titleFromWikiLink(catalogLink)
	const wiki = new WikiResearch(AbortSignal.timeout(15000), {
		preferredImage: curated?.image,
	})
	let page = title ? await wiki.read(title) : null
	const hasOverride = !!page
	let match: WikiContent["match"] = "exact"
	if (!page) {
		// Exact matches and partial title matches precede article-text results.
		// A few candidates allow for missing or stale wiki pages.
		const candidates = await wiki.search(name)
		for (const candidate of candidates.slice(0, 3)) {
			page = await wiki.read(candidate.title)
			if (!page) continue
			match = [candidate.title, page.title].some(
				(title) => title.toLowerCase() === name.toLowerCase(),
			)
				? "exact"
				: "related"
			break
		}
	}
	if (!page) return null
	const synopsis = introduction(page.content)
	if (page.disambiguation || (synopsis && /\bmay refer to\b/i.test(synopsis)))
		match = "ambiguous"
	const image =
		hasOverride && match === "exact" && curated?.image
			? page.images.find(
					(image) => image.file === curated.image?.replaceAll("_", " "),
				)
			: undefined
	const source = { title: page.title, url: page.url }
	return {
		type: match === "exact" ? "specific" : "generic",
		match,
		title: page.title,
		url: page.url,
		content: page.content,
		synopsis,
		sources: [source],
		mostProminentImage: image?.url,
		imageSource: image
			? {
					file: image.file,
					url: image.filePageUrl,
					article: source,
					description: image.caption || null,
				}
			: undefined,
	}
}
