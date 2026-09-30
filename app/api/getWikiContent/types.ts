import type { WikiSource } from "./wiki"

export type WikiContent = {
	type: "specific" | "generic"
	match: "exact" | "related" | "ambiguous" | null
	title: string
	url: string
	content: string
	synopsis: string | null
	highlights?: { label: string; detail: string; sources: WikiSource[] }[]
	sources: WikiSource[]
	mostProminentImage?: string
	imageSource?: {
		file: string
		url: string
		article: WikiSource
		description: string | null
	}
}

export type WikiProgress = {
	stage: "searching" | "reading" | "images" | "summarizing" | "fallback"
	article?: string
	pagesRead: number
	imagesChecked: number
}

export type WikiResearchEvent =
	| { type: "progress"; progress: WikiProgress }
	| { type: "result"; content: WikiContent | null }
