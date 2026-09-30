import "server-only"
import { fetchWiki } from "app/api/wikiRequest"
import type { DataType } from "app/data"
import { type LogoGuess, guessLogos } from "./guessLogos"

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

export type LogoSource =
	| "override"
	| "page image"
	| "filename"
	| "line logo"
	| "AI guess"

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
	sourcePage?: { title: string; url: string }
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
	const response = await fetchWiki(url, { next: { revalidate: REVALIDATE } })
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

type WikiPage = {
	title: string
	url: string
	image?: string
	files: string[]
	content: string
}

/** Keep the article, all its images, and the canonical URL through normalization and redirects. */
const getWikiPages = async (titles: string[]) => {
	const pages = new Map<string, WikiPage>()
	const unique = [...new Set(titles)]
	const chunks: string[][] = []
	for (let i = 0; i < unique.length; i += 50)
		chunks.push(unique.slice(i, i + 50))
	for (let i = 0; i < chunks.length; i += 4) {
		await Promise.all(
			chunks.slice(i, i + 4).map(async (chunk) => {
				const aliases = new Map<string, string>()
				const resolved = new Map<string, WikiPage>()
				let cont: Record<string, string> = {}
				while (true) {
					const result = await wikiFetch<{
						query?: {
							normalized?: { from: string; to: string }[]
							redirects?: { from: string; to: string }[]
							pages: {
								title: string
								missing?: boolean
								fullurl?: string
								pageimage?: string
								images?: { title: string }[]
								revisions?: {
									slots: { main: { content?: string; "*"?: string } }
								}[]
							}[]
						}
						continue?: Record<string, string>
					}>({
						action: "query",
						prop: "pageimages|images|info|revisions",
						piprop: "name",
						imlimit: "500",
						inprop: "url",
						rvprop: "content",
						rvslots: "main",
						redirects: "1",
						titles: chunk.join("|"),
						...cont,
					})
					for (const alias of [
						...(result.query?.normalized ?? []),
						...(result.query?.redirects ?? []),
					])
						aliases.set(alias.from, alias.to)
					for (const page of result.query?.pages ?? []) {
						if (page.missing) continue
						const previous = resolved.get(page.title)
						const revision = page.revisions?.[0]?.slots.main
						resolved.set(page.title, {
							title: page.title,
							url:
								page.fullurl ??
								`${WIKI_API.replace("api.php", "index.php/")}${encodeURIComponent(page.title)}`,
							image: page.pageimage ?? previous?.image,
							files: [
								...new Set([
									...(previous?.files ?? []),
									...(page.images ?? []).map((image) =>
										image.title.replace(/^File:/, "").replaceAll(" ", "_"),
									),
								]),
							],
							content:
								revision?.content ?? revision?.["*"] ?? previous?.content ?? "",
						})
					}
					if (!result.continue?.imcontinue) break
					cont = {
						continue: result.continue.continue ?? "",
						imcontinue: result.continue.imcontinue,
					}
				}
				for (const original of chunk) {
					let title = original
					const visited = new Set<string>()
					while (aliases.has(title) && !visited.has(title)) {
						visited.add(title)
						title = aliases.get(title) ?? title
					}
					const page = resolved.get(title)
					if (page) pages.set(original, page)
				}
			}),
		)
	}
	return pages
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
	company?: string
	code?: string
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
		company: line.company,
		code: line.code,
		link:
			"link" in line && typeof line.link === "string" ? line.link : undefined,
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
const resolveUncachedLogos = async (data: DataType) => {
	const entities = getEntities(data)
	const allFiles = await getAllFiles()

	/* overrides */
	const overrides = new Map<string, { logo?: string; icon?: string }>()
	for (const file of allFiles) {
		if (!file.name.toLowerCase().startsWith(OVERRIDE_PREFIX.toLowerCase()))
			continue
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

	/* wiki articles and candidate images for companies and named lines */
	const pageTitle = (entity: Entity) =>
		entity.link
			? decodeURIComponent(entity.link.split("/index.php/")[1] ?? entity.name)
			: entity.name
	const shortName = (entity: Entity) =>
		entity.companyName && entity.name.startsWith(`${entity.companyName} `)
			? entity.name.slice(entity.companyName.length + 1)
			: entity.name
	const pageTitles = (entity: Entity) => [
		...new Set([pageTitle(entity), shortName(entity)]),
	]
	const pages = await getWikiPages(entities.flatMap(pageTitles))
	const entityPages = (entity: Entity) =>
		[
			...new Set(
				pageTitles(entity)
					.map((title) => pages.get(title))
					.filter((page) => page !== undefined),
			),
		].filter((page) => {
			if (entity.kind === "company" || entity.link) return true
			if (!entity.companyName) return false
			// Shared names often resolve to another operator's article. Require ownership in the lead.
			const lead = page.content.split(/\n==/)[0] ?? ""
			const company = normalizeName(entity.companyName)
			return company.length >= 4
				? normalizeName(`${page.title} ${lead}`).includes(company)
				: `${page.title} ${lead}`
						.split(/[^a-z0-9]+/i)
						.some((word) => normalizeName(word) === company)
		})
	const mrtLineFiles = new Set(
		entities
			.filter(
				(entity) => entity.kind === "line" && entity.companyName === "MRT",
			)
			.flatMap((entity) =>
				[entity.name, shortName(entity)].flatMap(
					(name) => filesByName.get(`${normalizeName(name)}logo`) ?? [],
				),
			)
			.map((file) => file.name.replaceAll(" ", "_")),
	)
	const lineOwnsFile = (entity: Entity, file: string) => {
		if (
			entity.companyName !== "MRT" &&
			mrtLineFiles.has(file.replaceAll(" ", "_"))
		)
			return false
		return (
			entity.companyName === "MRT" ||
			entityPages(entity).some((page) =>
				[page.image, ...page.files].some(
					(image) => image?.replaceAll(" ", "_") === file.replaceAll(" ", "_"),
				),
			) ||
			Boolean(
				entity.companyName &&
					normalizeName(entity.companyName).length >= 4 &&
					normalizeName(file).includes(normalizeName(entity.companyName)),
			)
		)
	}

	const choices = new Map<
		string,
		{
			source: LogoSource
			sourcePage?: ResolvedLogo["sourcePage"]
			logo?: string
			icon?: string
			cropIcon?: boolean
		}
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
			const candidates = [entity.name, shortName(entity)]
				.flatMap((name) => filesByName.get(`${normalizeName(name)}logo`) ?? [])
				.filter((file) => lineOwnsFile(entity, file.name))
			const [best] = rankFiles(candidates)
			if (best)
				choices.set(entity.id, {
					source: "line logo",
					logo: best.name,
					cropIcon: entity.companyName === "MRT",
				})
			continue
		}

		const page = entityPages(entity).find((page) => page.image)
		const pageImage = page?.image
		if (
			pageImage &&
			!isVariant(pageImage) &&
			!/map|preview|screenshot|\d{4}-\d{2}-\d{2}/i.test(pageImage) &&
			(isLogoLike(pageImage) || normalizeName(pageImage).includes(key))
		) {
			choices.set(entity.id, {
				source: "page image",
				logo: pageImage,
				sourcePage: page && { title: page.title, url: page.url },
			})
			continue
		}

		// short names like "MRT" or "FR" would match far too much
		if (key.length < 4) continue
		const [best] = rankFiles(logoFiles.filter((file) => file.key.includes(key)))
		if (best) choices.set(entity.id, { source: "filename", logo: best.name })
	}

	/* Let the same model used for summaries review wiki candidates, preserving explicit overrides. */
	const guesses: LogoGuess[] = []
	const candidatePages = new Map<string, Map<string, WikiPage>>()
	for (const entity of entities) {
		const choice = choices.get(entity.id)
		if (
			choice?.source === "override" ||
			(choice?.source === "line logo" && entity.companyName === "MRT")
		)
			continue
		const ownPages = entityPages(entity)
		const company = entity.company
			? entities.find((e) => e.id === entity.company)
			: undefined
		const companyPages = company ? entityPages(company) : []
		const keys = [entity.name, shortName(entity), entity.code ?? ""]
			.map(normalizeName)
			.filter((key) => key.length >= 4)
		const matches = (file: string) =>
			keys.some((key) => normalizeName(withoutExtension(file)).includes(key))
		const sources = new Map<string, WikiPage>()
		const files = new Set<string>()
		const add = (file: string, page?: WikiPage) => {
			const name = file.replaceAll(" ", "_")
			if (
				entity.kind === "line" &&
				entity.companyName !== "MRT" &&
				mrtLineFiles.has(name)
			)
				return
			if (
				isVariant(name) ||
				/map|preview|screenshot|\d{4}-\d{2}-\d{2}/i.test(name)
			)
				return
			files.add(name)
			if (page) sources.set(name, page)
		}
		for (const page of ownPages) {
			if (page.image) add(page.image, page)
			for (const file of page.files)
				if (isLogoLike(file) || matches(file)) add(file, page)
		}
		for (const page of companyPages)
			for (const file of page.files)
				if (isLogoLike(file) && matches(file)) add(file, page)
		if (choice?.logo) add(choice.logo)
		for (const file of rankFiles(
			logoFiles.filter(
				(file) =>
					matches(file.name) &&
					(entity.kind === "company" || lineOwnsFile(entity, file.name)),
			),
		))
			add(file.name)
		const candidates = [...files].slice(0, 12)
		if (!candidates.length) continue
		candidatePages.set(entity.id, sources)
		guesses.push({
			id: entity.id,
			name: entity.name,
			kind: entity.kind,
			companyName: entity.companyName,
			candidates,
			pages: [
				...new Set([
					...ownPages,
					...candidates
						.map((file) => sources.get(file))
						.filter((page) => page !== undefined),
				]),
			].map((page) => ({
				title: page.title,
				url: page.url,
				content: page.content.slice(0, 12000),
			})),
		})
	}
	for (const [id, file] of await guessLogos(guesses)) {
		if (file === null) {
			choices.delete(id)
			continue
		}
		const page = candidatePages.get(id)?.get(file)
		choices.set(id, {
			source: "AI guess",
			logo: file,
			sourcePage: page && { title: page.title, url: page.url },
		})
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
			sourcePage: choice.sourcePage,
			logo,
			icon,
			// only crop logos that are actually shaped like MRT line logos
			cropIcon:
				choice.cropIcon && logo ? logo.width / logo.height >= 3 : undefined,
		}
	}

	return logos
}

export type Logos = Awaited<ReturnType<typeof resolveUncachedLogos>>

// The registry and logo API share a daily refresh, including concurrent cold requests.
const resolvedLogos = new WeakMap<
	DataType,
	{ expires: number; result: Promise<Logos> }
>()
export const resolveLogos = (data: DataType): Promise<Logos> => {
	const cached = resolvedLogos.get(data)
	if (cached && cached.expires > Date.now()) return cached.result
	const result = resolveUncachedLogos(data).catch((error) => {
		resolvedLogos.delete(data)
		throw error
	})
	resolvedLogos.set(data, { expires: Date.now() + REVALIDATE * 1000, result })
	return result
}
