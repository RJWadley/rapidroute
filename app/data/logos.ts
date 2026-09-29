import "server-only"
import type { DataType } from "app/data"

const WIKI_API = "https://wiki.minecartrapidtransit.net/api.php"

/**
 * logos are refreshed daily
 */
const REVALIDATE = 60 * 60 * 24

/**
 * anyone can upload a file named `RapidRoute-<Name>.png` to set the logo for a company or line,
 * and `RapidRoute-<Name>-icon.png` to set a square icon
 */
export const OVERRIDE_PREFIX = "RapidRoute-"

export type LogoSource = "override" | "page image" | "filename" | "line logo"

export type LogoImage = {
	file: string
	/**
	 * thumbnail sized for display
	 */
	url: string
	width: number
	height: number
	/**
	 * wiki page for the file
	 */
	page: string
}

export type ResolvedLogo = {
	source: LogoSource
	logo?: LogoImage
	icon?: LogoImage
	/**
	 * the logo has a square icon on its left edge (like MRT line logos) that we can crop out
	 */
	cropIcon?: boolean
}

type WikiFile = { name: string; timestamp: string }

const wikiFetch = async <T>(params: Record<string, string>): Promise<T> => {
	const url = `${WIKI_API}?${new URLSearchParams({
		format: "json",
		formatversion: "2",
		...params,
	})}`
	const response = await fetch(url, { next: { revalidate: REVALIDATE } })
	if (!response.ok) throw new Error(`wiki request failed: ${url}`)
	return response.json() as Promise<T>
}

/**
 * compare names without case, spacing, or punctuation
 */
export const normalizeName = (name: string) =>
	name.toLowerCase().replaceAll(/[^a-z0-9]/g, "")

const withoutExtension = (file: string) => file.replace(/\.[a-z0-9]+$/i, "")

const isLogoLike = (file: string) => /logo|roundel|icon|bullet/i.test(file)

/**
 * variants that are meant for specific backgrounds or contexts, and look bad in cards
 */
const isVariant = (file: string) =>
	/white|inverted|dark|_ad\b|ad\.|banner|words|text/i.test(file)

/**
 * get every file on the wiki (~17k files, 500 per request)
 */
const getAllFiles = async () => {
	const files: WikiFile[] = []
	let cont: Record<string, string> = {}

	while (true) {
		const result = await wikiFetch<{
			query: { allimages: WikiFile[] }
			continue?: Record<string, string>
		}>({
			action: "query",
			list: "allimages",
			ailimit: "500",
			aiprop: "timestamp",
			...cont,
		})
		files.push(...result.query.allimages)
		if (!result.continue) return files
		cont = result.continue
	}
}

/**
 * get the lead image for each page title, if the page has one
 */
const getPageImages = async (titles: string[]) => {
	const images = new Map<string, string>()

	for (let i = 0; i < titles.length; i += 50) {
		const chunk = titles.slice(i, i + 50)
		const result = await wikiFetch<{
			query?: {
				normalized?: { from: string; to: string }[]
				redirects?: { from: string; to: string }[]
				pages: { title: string; pageimage?: string }[]
			}
		}>({
			action: "query",
			prop: "pageimages",
			piprop: "name",
			redirects: "1",
			titles: chunk.join("|"),
		})

		// map the final page title back to the title we asked for
		const aliases = [
			...(result.query?.normalized ?? []),
			...(result.query?.redirects ?? []),
		]
		const originalTitle = (title: string): string => {
			const alias = aliases.find((a) => a.to === title)
			return alias && alias.from !== title ? originalTitle(alias.from) : title
		}

		for (const page of result.query?.pages ?? []) {
			if (page.pageimage) images.set(originalTitle(page.title), page.pageimage)
		}
	}

	return images
}

/**
 * get urls and sizes for files
 */
const getImageInfo = async (files: string[]) => {
	const info = new Map<string, LogoImage>()
	const unique = [...new Set(files)]

	for (let i = 0; i < unique.length; i += 50) {
		const chunk = unique.slice(i, i + 50)
		const result = await wikiFetch<{
			query?: {
				pages: {
					title: string
					imageinfo?: {
						url: string
						thumburl?: string
						width: number
						height: number
						descriptionurl: string
					}[]
				}[]
			}
		}>({
			action: "query",
			prop: "imageinfo",
			iiprop: "url|size",
			// fit thumbnails within 480x128
			iiurlwidth: "480",
			iiurlheight: "128",
			titles: chunk.map((file) => `File:${file}`).join("|"),
		})

		for (const page of result.query?.pages ?? []) {
			const image = page.imageinfo?.[0]
			if (!image) continue
			const file = page.title.replace(/^File:/, "").replaceAll(" ", "_")
			info.set(file, {
				file,
				url: image.thumburl ?? image.url,
				width: image.width,
				height: image.height,
				page: image.descriptionurl,
			})
		}
	}

	return info
}

type Entity = {
	id: string
	name: string
	kind: "company" | "line"
	/**
	 * for lines, the company that runs them
	 */
	companyName?: string
	/**
	 * the wiki page for this entity, if known
	 */
	link?: string
}

const getEntities = (data: DataType): Entity[] => [
	...data.companies.list.map((company) => ({
		id: company.i,
		name: company.name,
		kind: "company" as const,
		link: "link" in company ? company.link : undefined,
	})),
	...data.connectionLines.list.map((line) => ({
		id: line.i,
		name: line.name || line.code,
		kind: "line" as const,
		companyName: data.companies.map.get(line.company)?.name,
	})),
]

/**
 * newest first, then prefer files that say "logo", then shorter names
 */
const rankFiles = (files: WikiFile[]) =>
	files.toSorted(
		(a, b) =>
			b.timestamp.localeCompare(a.timestamp) ||
			Number(/logo/i.test(b.name)) - Number(/logo/i.test(a.name)) ||
			a.name.length - b.name.length,
	)

/**
 * figure out the best logo for every company and line
 *
 * 1. overrides - `RapidRoute-<Name>.png` and `RapidRoute-<Name>-icon.png`
 * 2. line logos - `<Line Name>_logo.png` (this is how MRT lines are named)
 * 3. the lead image of the company's wiki page, if it looks like a logo
 * 4. logo-ish files with the company name in them
 */
export const resolveLogos = async (data: DataType) => {
	const entities = getEntities(data)
	const allFiles = await getAllFiles()

	/* overrides */
	const overrides = new Map<string, { logo?: string; icon?: string }>()
	for (const file of allFiles) {
		if (!file.name.startsWith(OVERRIDE_PREFIX)) continue
		const name = withoutExtension(file.name.slice(OVERRIDE_PREFIX.length))
		const isIcon = /-icon$/i.test(name)
		const key = normalizeName(name.replace(/-icon$/i, ""))
		const existing = overrides.get(key) ?? {}
		overrides.set(key, { ...existing, [isIcon ? "icon" : "logo"]: file.name })
	}

	/* files by normalized name, for exact matching */
	const filesByName = new Map<string, WikiFile[]>()
	for (const file of allFiles) {
		const key = normalizeName(withoutExtension(file.name))
		filesByName.set(key, [...(filesByName.get(key) ?? []), file])
	}
	const logoFiles = allFiles
		.filter((file) => isLogoLike(file.name) && !isVariant(file.name))
		.map((file) => ({
			...file,
			key: normalizeName(withoutExtension(file.name)),
		}))

	/* page images for companies */
	const pageTitle = (entity: Entity) =>
		entity.link
			? decodeURIComponent(entity.link.split("/index.php/")[1] ?? entity.name)
			: entity.name
	const companies = entities.filter((e) => e.kind === "company")
	const pageImages = await getPageImages(companies.map(pageTitle))

	const choices = new Map<
		string,
		{ source: LogoSource; logo?: string; icon?: string; cropIcon?: boolean }
	>()

	for (const entity of entities) {
		const key = normalizeName(entity.name)

		const override = overrides.get(key)
		if (override) {
			choices.set(entity.id, { source: "override", ...override })
			continue
		}

		if (entity.kind === "line") {
			// "MRT Northern Line" -> Northern_Line_logo.png, "MRT Red Line" -> MRT_Red_Line_logo.png
			const shortName =
				entity.companyName && entity.name.startsWith(`${entity.companyName} `)
					? entity.name.slice(entity.companyName.length + 1)
					: undefined
			const candidates = [entity.name, shortName]
				.filter((name) => name !== undefined)
				.flatMap((name) => filesByName.get(`${normalizeName(name)}logo`) ?? [])
			const [best] = rankFiles(candidates)
			if (best)
				choices.set(entity.id, {
					source: "line logo",
					logo: best.name,
					cropIcon: entity.companyName === "MRT",
				})
			continue
		}

		const pageImage = pageImages.get(pageTitle(entity))
		if (
			pageImage &&
			!isVariant(pageImage) &&
			!/map|preview|screenshot|\d{4}-\d{2}-\d{2}/i.test(pageImage) &&
			(isLogoLike(pageImage) || normalizeName(pageImage).includes(key))
		) {
			choices.set(entity.id, { source: "page image", logo: pageImage })
			continue
		}

		// short names like "MRT" or "FR" would match far too much
		if (key.length < 4) continue
		const [best] = rankFiles(logoFiles.filter((file) => file.key.includes(key)))
		if (best) choices.set(entity.id, { source: "filename", logo: best.name })
	}

	const info = await getImageInfo(
		[...choices.values()]
			.flatMap((choice) => [choice.logo, choice.icon])
			.filter((file) => file !== undefined)
			.map((file) => file.replaceAll(" ", "_")),
	)

	const logos: Record<string, ResolvedLogo> = {}
	for (const [id, choice] of choices) {
		const logo = choice.logo
			? info.get(choice.logo.replaceAll(" ", "_"))
			: undefined
		const icon = choice.icon
			? info.get(choice.icon.replaceAll(" ", "_"))
			: undefined
		if (!logo && !icon) continue

		logos[id] = {
			source: choice.source,
			logo,
			icon,
			// only crop logos that are actually shaped like MRT line logos
			cropIcon:
				choice.cropIcon && logo ? logo.width / logo.height >= 3 : undefined,
		}
	}

	return logos
}

export type Logos = Awaited<ReturnType<typeof resolveLogos>>
