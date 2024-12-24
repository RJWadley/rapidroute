import type { SearchResponse } from "../../types/PageSearch"
import type { ParseResponse } from "../../types/ParseQuery"
import { RAW_WIKI_URL, getWikiURL } from "../../url"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import dedent from "dedent"
import {
	loadImageDimensions,
	updateImageDimensions,
} from "./getImageDimensions"

export const dynamic = "force-static"

const googleModel = google("gemini-1.5-flash", {
	safetySettings: [
		{
			category: "HARM_CATEGORY_DANGEROUS_CONTENT",
			threshold: "BLOCK_NONE",
		},
		{
			category: "HARM_CATEGORY_HARASSMENT",
			threshold: "BLOCK_NONE",
		},
		{
			category: "HARM_CATEGORY_HATE_SPEECH",
			threshold: "BLOCK_NONE",
		},
		{
			category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
			threshold: "BLOCK_NONE",
		},
	],
})

export type WikiResult = {
	content: string
	title: string
	mainImage: {
		width: number
		height: number
		src: string
	} | null
	type: "specific" | "generic"
}

export const GET = async (
	_: unknown,
	{ params }: { params: Promise<{ name: string }> },
) => {
	const name = await (await params).name
	if (!name) return new Response("name is required", { status: 400 })

	const wikiURL = getWikiURL()

	const specificParams = {
		action: "query",
		list: "search",
		srwhat: "nearmatch",
		srsearch: name,
		format: "json",
		srlimit: "1",
	}
	const specificUrl = `${wikiURL}api.php?${new URLSearchParams(
		specificParams,
	).toString()}`
	const genericParams = {
		...specificParams,
		srwhat: "text",
	}
	const genericUrl = `${wikiURL}api.php?${new URLSearchParams(
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
		: ({
				type: "generic",
				...genericResult,
			} as const)

	const pageParams = {
		action: "parse",
		page: result?.title ?? "",
		format: "json",
		redirects: "true",
		mobileformat: "true",
	}
	const url = `${wikiURL}api.php?${new URLSearchParams(pageParams).toString()}`
	const content = await fetch(url).then(
		(res) => res.json() as Promise<ParseResponse>,
	)

	const text = content.parse?.text["*"]
		.replaceAll("{{{subtextcolor}}}", "var(--default-text)")
		.replaceAll("#ccf", "#ddd")
		// make sure URLs are valid
		.replaceAll('src="/', `src="${RAW_WIKI_URL}`)
		.replaceAll('href="/', `href="${RAW_WIKI_URL}`)
		// split apart any srcset attributes, upgrade the src, and rejoin them
		.replaceAll(/srcset="(.*?)"/g, (match: string, p1: string) => {
			const srcset = p1
				.split(",")
				.map((src) => src.trim())
				.map((src) => {
					const [imageURL, size] = src.split(" ")
					return `${RAW_WIKI_URL}${imageURL} ${size}
`
				})
				.join(",")
			return `srcset="${srcset}"`
		})

	const synopsis = await generateObject({
		model: googleModel,
		prompt: dedent(`
			Given a wiki article, create a place details synopsis for a online maps listing for that place.

			Use HTML tags to structure the synopsis.
			structure the synopsis as headings and paragraphs. each heading should be followed by one or two paragraphs.
			you may use h3 and h4 tags for subheadings as needed.
			
			If there are images in the article include them using img tags if they are revelant. include a caption for each image using <caption> tags.

			start with a top level h1 of '${result.title || "Untitled"}'
			and a p with a overview paragraph
			then, include the rest of the synopsis

			this is for mobile devices, so:
			tables are not allowed
			floats are not allowed

			ARTICLE:

			${text}
		`),
		schema: z.object({
			mainImage: z
				.string()
				.optional()
				.describe(
					"if there is a prominent image, include it here for preview purposes",
				),
			innerHTML: z.string(),
		}),
	})

	return new Response(
		JSON.stringify({
			content: await updateImageDimensions(synopsis.object.innerHTML),
			title: result?.title ?? "Untitled",
			type: result.type,
			mainImage: synopsis.object.mainImage
				? await loadImageDimensions(synopsis.object.mainImage)
				: null,
		} satisfies WikiResult),
		{
			headers: {
				"content-type": "application/json",
			},
		},
	)
}
