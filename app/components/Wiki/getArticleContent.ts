import type { SearchResponse } from "./types/PageSearch"
import type { ParseResponse } from "./types/ParseQuery"

const WIKI_URL = "https://wiki.minecartrapidtransit.net/"

export const getArticleContent = async (name: string) => {
	const specificParams = {
		action: "query",
		list: "search",
		srwhat: "nearmatch",
		srsearch: name,
		format: "json",
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

	const specificResults: SearchResponse = await fetch(specificUrl).then((res) =>
		res.json(),
	)
	const genericResults: SearchResponse = await fetch(genericUrl).then((res) =>
		res.json(),
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
	const url = `${WIKI_URL}api.php?${new URLSearchParams(pageParams).toString()}`
	const content: ParseResponse = await fetch(url).then((res) => res.json())

	return {
		...result,
		content: // fix colors and change the default background
			content.parse?.text["*"]
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
				}),
	}
}
