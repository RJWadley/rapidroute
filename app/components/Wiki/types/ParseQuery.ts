// Generated by https://quicktype.io

export interface ParseResponse {
	parse?: Parse
}

export interface Parse {
	title: string
	pageid: number
	revid: number
	text: Text
	langlinks: unknown[]
	categories: Category[]
	links: Link[]
	templates: Link[]
	images: string[]
	externallinks: unknown[]
	sections: unknown[]
	parsewarnings: unknown[]
	displaytitle: string
	iwlinks: unknown[]
	properties: Property[]
}

export interface Category {
	sortkey: string
	"*": string
}

export interface Link {
	ns: number
	exists: string
	"*": string
}

export interface Property {
	name: string
	"*": string
}

export interface Text {
	"*": string
}
