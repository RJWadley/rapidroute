import "server-only"
import { load } from "cheerio"
import type { SearchResponse } from "./types/PageSearch"
import type { ParseResponse } from "./types/ParseQuery"

const WIKI = "https://wiki.minecartrapidtransit.net/"
const IMAGE_BYTES = 2 * 1024 * 1024
const fileName = (name: string) =>
	name.replace(/^File:/, "").replaceAll("_", " ")
export const wikiPageUrl = (title: string) =>
	`${WIKI}index.php/${encodeURIComponent(title.replaceAll(" ", "_"))}`

export type WikiSource = { title: string; url: string }
export type WikiImage = {
	id: string
	file: string
	url: string
	filePageUrl: string
	article: WikiSource
	caption: string
	width: number
	height: number
}
export type WikiPage = WikiSource & {
	content: string
	text: string
	disambiguation: boolean
	links: WikiSource[]
	images: WikiImage[]
}

type ImageInfoResponse = {
	query?: {
		pages?: {
			title: string
			imageinfo?: {
				url: string
				thumburl?: string
				width: number
				height: number
				thumbwidth?: number
				thumbheight?: number
			}[]
		}[]
	}
}

/** A request-scoped wiki reader. All tools share the same evidence and budgets. */
export class WikiResearch {
	readonly pages = new Map<string, WikiPage>()
	readonly images = new Map<string, WikiImage>()
	readonly inspected = new Set<string>()
	imageAttempts = 0
	private searches = new Map<string, Promise<WikiSource[]>>()
	private reads = new Map<string, Promise<WikiPage | null>>()
	private inspections = new Map<
		string,
		Promise<ReturnType<WikiResearch["imageResult"]>>
	>()

	constructor(
		private signal: AbortSignal,
		private options: { preferredImage?: string } = {},
	) {}

	private async api<T>(
		params: Record<string, string>,
		signal?: AbortSignal,
	): Promise<T> {
		const response = await fetch(
			`${WIKI}api.php?${new URLSearchParams({ format: "json", ...params })}`,
			{
				cache: "force-cache",
				next: { revalidate: 86400 },
				signal: AbortSignal.any([
					this.signal,
					AbortSignal.timeout(10000),
					...(signal ? [signal] : []),
				]),
			},
		)
		if (!response.ok) throw new Error("The wiki request failed")
		return response.json() as Promise<T>
	}

	search(query: string, signal?: AbortSignal) {
		const cached = this.searches.get(query)
		if (cached) return cached
		if (this.searches.size >= 4) throw new Error("Wiki search budget reached")
		const request = this.searchArticles(query, signal)
		this.searches.set(query, request)
		return request
	}

	private async searchArticles(query: string, signal?: AbortSignal) {
		const results = await Promise.all(
			["nearmatch", "title", "text"].map((srwhat) =>
				this.api<SearchResponse>(
					{
						action: "query",
						list: "search",
						srwhat,
						srsearch: query,
						srnamespace: "0",
						srlimit: "8",
					},
					signal,
				),
			),
		)
		return [
			...new Map(
				results.flatMap((result) =>
					(result.query?.search ?? []).map((page) => [
						page.title,
						{
							title: page.title,
							url: wikiPageUrl(page.title),
							snippet: load(page.snippet ?? "", null, false).text(),
						},
					]),
				),
			).values(),
		].slice(0, 12)
	}

	read(title: string, signal?: AbortSignal) {
		const page = this.pages.get(title)
		if (page) return Promise.resolve(page)
		const cached = this.reads.get(title)
		if (cached) return cached
		if (this.reads.size >= 6) throw new Error("Wiki article budget reached")
		const request = this.readArticle(title, signal)
		this.reads.set(title, request)
		return request
	}

	private async readArticle(
		title: string,
		signal?: AbortSignal,
	): Promise<WikiPage | null> {
		const { parse } = await this.api<ParseResponse>(
			{
				action: "parse",
				page: title,
				redirects: "1",
				prop: "text|links|images|categories",
			},
			signal,
		)
		if (!parse?.text?.["*"]) return null
		const source = { title: parse.title, url: wikiPageUrl(parse.title) }
		const $ = load(parse.text["*"], null, false)
		$("[src], [href], [srcset]").each((_, element) => {
			const node = $(element)
			for (const attr of ["src", "href"]) {
				const value = node.attr(attr)
				if (value && !value.startsWith("#")) {
					try {
						const url = new URL(value, WIKI)
						if (["https:", "http:"].includes(url.protocol))
							node.attr(attr, url.href)
						else node.removeAttr(attr)
					} catch {
						node.removeAttr(attr)
					}
				}
			}
			const srcset = node.attr("srcset")
			if (srcset)
				node.attr(
					"srcset",
					srcset
						.split(",")
						.flatMap((candidate) => {
							const [url, size] = candidate.trim().split(/\s+/)
							try {
								const absolute = new URL(url ?? "", WIKI)
								return ["https:", "http:"].includes(absolute.protocol)
									? [`${absolute.href}${size ? ` ${size}` : ""}`]
									: []
							} catch {
								return []
							}
						})
						.join(", "),
				)
		})
		const content = $.html()
			.replaceAll("{{{subtextcolor}}}", "var(--default-text)")
			.replaceAll("#ccf", "#ddd")
		const evidence = $.root().clone()
		evidence.find("script, style, .mw-editsection, #toc").remove()
		evidence.find("p, li, td, th, h1, h2, h3, h4, br").append("\n")
		const text = evidence
			.text()
			.replace(/[ \t]+/g, " ")
			.replace(/\n\s*\n/g, "\n")
			.trim()
			.slice(0, 18000)
		const listedFiles = [...new Set((parse.images ?? []).map(fileName))]
		const preferred = this.options.preferredImage
			? fileName(this.options.preferredImage)
			: undefined
		const files = [
			...new Set([
				...(preferred && listedFiles.includes(preferred) ? [preferred] : []),
				...listedFiles,
			]),
		].slice(0, 12)
		let images: WikiImage[] = []
		if (files.length) {
			try {
				const info = await this.api<ImageInfoResponse>(
					{
						action: "query",
						formatversion: "2",
						prop: "imageinfo",
						titles: files.map((file) => `File:${file}`).join("|"),
						iiprop: "url|size",
						iiurlwidth: "600",
					},
					signal,
				)
				images = (info.query?.pages ?? []).flatMap((filePage) => {
					const image = filePage.imageinfo?.[0]
					if (!image) return []
					const url = image.thumburl || image.url
					if (!this.isWikiImage(url)) return []
					const file = fileName(filePage.title)
					const img = $("img")
						.toArray()
						.find((element) => {
							try {
								return decodeURIComponent($(element).attr("src") ?? "")
									.replaceAll("_", " ")
									.includes(file)
							} catch {
								return false
							}
						})
					return [
						{
							id: filePage.title,
							file,
							url,
							filePageUrl: wikiPageUrl(filePage.title),
							article: source,
							caption: img
								? $(img)
										.closest(".thumb, figure")
										.find(".thumbcaption, figcaption")
										.text()
										.trim()
										.slice(0, 500)
								: "",
							width: image.thumbwidth ?? image.width,
							height: image.thumbheight ?? image.height,
						},
					]
				})
			} catch {
				/* Images are optional; retain the article if metadata is unavailable. */
			}
		}
		for (const image of images) this.images.set(image.id, image)
		const page: WikiPage = {
			...source,
			content,
			text,
			disambiguation: (parse.categories ?? []).some(
				(category) =>
					category["*"].replaceAll("_", " ") === "Disambiguation pages",
			),
			images,
			links: (parse.links ?? [])
				.filter((link) => link.ns === 0 && link.exists !== undefined)
				.slice(0, 80)
				.map((link) => ({ title: link["*"], url: wikiPageUrl(link["*"]) })),
		}
		this.pages.set(page.title, page)
		return page
	}

	private isWikiImage(value: string) {
		try {
			const url = new URL(value)
			return (
				url.origin === new URL(WIKI).origin &&
				url.pathname.startsWith("/images/") &&
				!url.username &&
				!url.password
			)
		} catch {
			return false
		}
	}

	private imageResult(image: WikiImage, data: string, mediaType: string) {
		return { ...image, data, mediaType }
	}

	inspect(id: string, signal?: AbortSignal) {
		const cached = this.inspections.get(id)
		if (cached) return cached
		if (this.imageAttempts >= 4) throw new Error("Wiki image budget reached")
		this.imageAttempts++
		const image = this.images.get(id)
		if (!image)
			throw new Error("Select an image from a previously read article")
		const request = this.downloadImage(image, signal)
		this.inspections.set(id, request)
		return request
	}

	private async downloadImage(image: WikiImage, signal?: AbortSignal) {
		const response = await fetch(image.url, {
			cache: "force-cache",
			next: { revalidate: 86400 },
			redirect: "error",
			signal: AbortSignal.any([
				this.signal,
				AbortSignal.timeout(10000),
				...(signal ? [signal] : []),
			]),
		})
		const mediaType = response.headers.get("content-type")?.split(";")[0] ?? ""
		if (
			!response.ok ||
			!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
				mediaType,
			) ||
			Number(response.headers.get("content-length")) > IMAGE_BYTES
		)
			throw new Error("Wiki image is unavailable or too large")
		const reader = response.body?.getReader()
		if (!reader) throw new Error("Wiki image is empty")
		const chunks: Uint8Array[] = []
		let size = 0
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			size += value.byteLength
			if (size > IMAGE_BYTES) {
				await reader.cancel()
				throw new Error("Wiki image is too large")
			}
			chunks.push(value)
		}
		if (!size) throw new Error("Wiki image is empty")
		this.inspected.add(image.id)
		return this.imageResult(
			image,
			Buffer.concat(chunks).toString("base64"),
			mediaType,
		)
	}
}
