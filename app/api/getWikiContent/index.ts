import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import dedent from "dedent"
import { z } from "zod"
import type { SearchResponse } from "./types/PageSearch"
import type { ParseResponse } from "./types/ParseQuery"
import { loadImageDimensions } from "./getImageDimensions"

export const dynamic = "force-static"

const WIKI_URL = "https://wiki.minecartrapidtransit.net/"

const googleModel = google("gemini-2.5-flash", {
	safetySettings: (
		[
			"HARM_CATEGORY_UNSPECIFIED",
			"HARM_CATEGORY_HATE_SPEECH",
			"HARM_CATEGORY_DANGEROUS_CONTENT",
			"HARM_CATEGORY_HARASSMENT",
			"HARM_CATEGORY_SEXUALLY_EXPLICIT",
			"HARM_CATEGORY_CIVIC_INTEGRITY",
		] as const
	).map((category) => ({ category, threshold: "BLOCK_NONE" })),
})

const schema = z.object({
	innerHTML: z.array(
		z.object({
			tagName: z.enum([
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"p",
				"figure",
				"ol",
				"ul",
			]),
			textContent: z
				.array(
					z.object({
						text: z.string(),
						href: z.string().optional(),
						reactStyleObject: z.record(z.string(), z.string()).optional(),
					}),
				)
				.optional(),
			figure: z
				.object({
					src: z.string(),
					alt: z.string(),
					caption: z.string(),
				})
				.optional(),
		}),
	),
})

const addImageDimensions = (result: z.infer<typeof schema>["innerHTML"]) => {
	return Promise.all(
		result.map(async (node) => {
			const figure = node.figure

			return {
				...node,
				figure: figure
					? {
							...figure,
							...(await loadImageDimensions(figure.src)),
						}
					: undefined,
			}
		}),
	)
}

export type WikiResult = {
	url: string
	content: Awaited<ReturnType<typeof addImageDimensions>>
	title: string
	type: "specific" | "generic"
} | null

export const getWikiContent = async (name: string) => {
	if (!name) throw new Error("name is required")

	const specificParams = {
		action: "query",
		list: "search",
		srwhat: "nearmatch",
		srsearch: name,
		format: "json",
		srlimit: "1",
	}
	const specificUrl = `${WIKI_URL}api.php?${new URLSearchParams(
		specificParams,
	).toString()}`
	const genericParams = {
		...specificParams,
		srwhat: "text",
	}
	const genericUrl = `${WIKI_URL}api.php?${new URLSearchParams(
		genericParams,
	).toString()}`

	const specificResults = await fetch(specificUrl).then(
		(res) => res.json() as Promise<SearchResponse>,
	)
	const genericResults = await fetch(genericUrl).then(
		(res) => res.json() as Promise<SearchResponse>,
	)

	const genericResult = genericResults?.query.search[0]
	const specificResult = specificResults?.query.search[0]

	const result = specificResult
		? ({
				type: "specific",
				...specificResult,
			} as const)
		: genericResult
			? ({
					type: "generic",
					...genericResult,
				} as const)
			: null

	if (!result) return null

	const pageParams = {
		action: "parse",
		page: result?.title ?? "",
		format: "json",
		redirects: "true",
		mobileformat: "true",
	}
	const url = `${WIKI_URL}api.php?${new URLSearchParams(pageParams).toString()}`
	const content = await fetch(url).then(
		(res) => res.json() as Promise<ParseResponse>,
	)

	const text = content.parse?.text["*"]
		.replaceAll("{{{subtextcolor}}}", "var(--default-text)")
		.replaceAll("#ccf", "#ddd")
		// make sure URLs are valid
		.replaceAll('src="/', `src="${WIKI_URL}`)
		.replaceAll('href="/', `href="${WIKI_URL}`)
		// split apart any srcset attributes, upgrade the src, and rejoin them
		.replaceAll(/srcset="(.*?)"/g, (match: string, p1: string) => {
			const srcset = p1
				.split(",")
				.map((src) => src.trim())
				.map((src) => {
					const [imageURL, size] = src.split(" ")
					return `${WIKI_URL}${imageURL} ${size}
`
				})
				.join(",")
			return `srcset="${srcset}"`
		})

	const synopsis = await generateObject({
		model: googleModel,
		prompt: dedent(`
			ARTICLE:
			${text}

			Given a wiki article, create a place details synopsis for a online maps listing for that place.

			structure the synopsis as headings and paragraphs. each heading should be followed by one or two paragraphs.
			you may use h3 and h4 tags for subheadings as needed.
			
			If there are images in the article include if they are relevant AND not a flag/marker.

			start with a prominent image if one exists,
			then, include atop level h1 of '${result.title || "Untitled"}'
			then, include an h2 with a subtitle, like 'City in Ward 2', 'Airport in Sampletown', 'Station on the MRT Western Line', etc.
			and a p with a overview paragraph
			then, include the rest of the synopsis

			this is for mobile devices, so:
			tables are not allowed
			floats are not allowed
		`),
		schema,
	})

	return {
		content: await addImageDimensions(synopsis.object.innerHTML),
		title: result.title,
		url: `${WIKI_URL}index.php/${result.title}`,
		type: result.type,
	} satisfies WikiResult
}
