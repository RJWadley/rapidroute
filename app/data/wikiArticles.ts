import "server-only"

export type CuratedWikiArticle = {
	article: string
	world?: string
	/** Exact wiki filename of a manually selected photo; omit to show no photo. */
	image?: string
}

/**
 * Wiki-only view, verified September 2026. Keys are RapidRoute place IDs.
 * Keep these choices independent of generated research. Article introductions
 * and image URLs are loaded from the wiki so they stay current.
 */
export const curatedWikiArticles: ReadonlyMap<string, CuratedWikiArticle> =
	new Map([
		[
			"Deadbush",
			{
				article: "Deadbush",
				world: "New",
				image: "Deadbush Pioneer district in Jul 2018.png",
			},
		],
		["Kyoto", { article: "Kyoto (Ward 9)", world: "New" }],
		[
			"New+Kyoto",
			{
				article: "New Kyoto",
				world: "New",
				image: "New Kyoto in September 2025.png",
			},
		],
		[
			"Central+City",
			{ article: "Central City", world: "New", image: "CentralParkMRT.png" },
		],
		["Oaksville", { article: "Oaksville", world: "New" }],
		["Bloomington", { article: "Bloomington", world: "Old" }],
		[
			"True+City",
			{ article: "True City", world: "Old", image: "TrueCity.png" },
		],
	])
