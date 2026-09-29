"use client"

import type { Company } from "app/data"
import type { ResolvedLogo } from "app/data/logos"
import { theme } from "app/utils/theme"
import Link from "next/link"
import { useState } from "react"
import { styled } from "restyle"
import { LogoFull, LogoIcon, hasIcon } from "./CompanyLogo"

export type RegistryCompany = {
	id: string
	name: string
	type: Company["type"]
	link?: string
	logo?: ResolvedLogo
	flightCount: number
	lines: {
		id: string
		name: string
		code: string
		color?: string
		logo?: ResolvedLogo
	}[]
}

const WIKI_URL = "https://wiki.minecartrapidtransit.net/index.php"

const typeNames: Record<Company["type"], string> = {
	AirAirline: "Airline",
	RailCompany: "Rail",
	SeaCompany: "Ferry",
	BusCompany: "Bus",
}

const sourceNames: Record<ResolvedLogo["source"], string> = {
	override: "Set on the wiki",
	"page image": "Guessed from wiki page",
	filename: "Guessed from file name",
	"line logo": "Line logo",
}

/**
 * link to the wiki upload page with the override filename filled in
 */
const uploadLink = (name: string, icon = false) => {
	// these characters aren't allowed in wiki file names, and we ignore punctuation when matching anyway
	const safeName = name.replaceAll(/[#<>[\]|{}:/\\]/g, "")
	const file = `RapidRoute-${safeName}${icon ? "-icon" : ""}.png`
	return {
		file,
		href: `${WIKI_URL}?${new URLSearchParams({
			title: "Special:Upload",
			wpDestFile: file,
		})}`,
	}
}

const normalize = (text: string) => text.toLowerCase().replaceAll(/\s+/g, "")

export default function Registry({
	companies,
}: {
	companies: RegistryCompany[]
}) {
	const [query, setQuery] = useState("")
	const [type, setType] = useState<Company["type"] | "all">("all")
	const [missingOnly, setMissingOnly] = useState(false)

	const filtered = companies.filter(
		(company) =>
			(type === "all" || company.type === type) &&
			(!missingOnly || !company.logo) &&
			(!query ||
				normalize(company.name).includes(normalize(query)) ||
				company.lines.some((line) =>
					normalize(`${line.name}${line.code}`).includes(normalize(query)),
				)),
	)

	const withLogos = companies.filter((company) => company.logo).length

	return (
		<Page>
			<Header>
				<BackLink href="/">← Back to map</BackLink>
				<h1>Companies</h1>
				<p>
					Every airline, rail, ferry, and bus company RapidRoute knows about.{" "}
					{withLogos} of {companies.length} have a logo.
				</p>
				<details>
					<summary>How logos work</summary>
					<p>
						Logos come from the MRT wiki. To choose the logo RapidRoute uses for
						a company or line, upload a file named{" "}
						<code>RapidRoute-Company Name.png</code>. For a square version (used
						in route steps), upload{" "}
						<code>RapidRoute-Company Name-icon.png</code>. Capitalization,
						spaces, and punctuation don't matter.
					</p>
					<p>
						Without one, RapidRoute guesses: MRT lines use their{" "}
						<code>Line_logo</code> file, and companies use the main image of
						their wiki page, or a file with their name and "logo" in it. Logos
						refresh once a day.
					</p>
				</details>
				<Controls>
					<Search
						type="search"
						placeholder="Search companies and lines"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<Filters>
						{(["all", ...Object.keys(typeNames)] as const).map((key) => (
							<Filter
								key={key}
								type="button"
								active={type === key}
								onClick={() => setType(key as typeof type)}
							>
								{key === "all" ? "All" : typeNames[key as Company["type"]]}
							</Filter>
						))}
						<Filter
							type="button"
							active={missingOnly}
							onClick={() => setMissingOnly(!missingOnly)}
						>
							Missing logo
						</Filter>
					</Filters>
				</Controls>
			</Header>

			<Grid>
				{filtered.map((company) => (
					<CompanyCard key={company.id} company={company} />
				))}
				{filtered.length === 0 && <Muted>No companies match.</Muted>}
			</Grid>
		</Page>
	)
}

function CompanyCard({ company }: { company: RegistryCompany }) {
	const upload = uploadLink(company.name)
	const iconUpload = uploadLink(company.name, true)
	const counts = [
		company.flightCount > 0 &&
			`${company.flightCount} flight${company.flightCount === 1 ? "" : "s"}`,
		company.lines.length > 0 &&
			`${company.lines.length} line${company.lines.length === 1 ? "" : "s"}`,
	].filter(Boolean)

	return (
		<Card id={company.id}>
			<LogoArea>
				{company.logo ? (
					<LogoFull
						logo={company.logo}
						name={company.name}
						maxWidth={240}
						height={64}
					/>
				) : (
					<Placeholder>{company.name.slice(0, 2)}</Placeholder>
				)}
				{company.logo?.icon && (
					<LogoIcon logo={company.logo} name={company.name} size={64} />
				)}
			</LogoArea>

			<CardHeader>
				<Name>{company.name}</Name>
				<Muted>
					{[typeNames[company.type], ...counts].join(" · ")}
					{company.link && (
						<>
							{" · "}
							<a href={company.link} target="_blank" rel="noreferrer">
								Wiki
							</a>
						</>
					)}
				</Muted>
			</CardHeader>

			<Muted>
				{company.logo ? (
					<>
						{sourceNames[company.logo.source]}
						{company.logo.logo && (
							<>
								{": "}
								<a
									href={company.logo.logo.page}
									target="_blank"
									rel="noreferrer"
								>
									{company.logo.logo.file}
								</a>
							</>
						)}
					</>
				) : (
					"No logo found"
				)}
			</Muted>
			<Muted>
				<a href={upload.href} target="_blank" rel="noreferrer">
					{company.logo?.source === "override" ? "Replace" : "Set"} logo
				</a>
				{" · "}
				<a href={iconUpload.href} target="_blank" rel="noreferrer">
					{company.logo?.icon ? "Replace" : "Set"} icon
				</a>
			</Muted>

			{company.lines.length > 0 && (
				<details>
					<summary>
						{company.lines.length} line{company.lines.length === 1 ? "" : "s"}
					</summary>
					<Lines>
						{company.lines.map((line) => (
							<LineRow key={line.id} id={line.id}>
								{hasIcon(line.logo) ? (
									<LogoIcon logo={line.logo} name={line.name} size={28} />
								) : (
									<Swatch style={{ background: line.color ?? "#888888" }} />
								)}
								<div>
									{line.name}
									{line.code !== line.name && <Muted> · {line.code}</Muted>}
								</div>
								<a
									href={uploadLink(line.name).href}
									target="_blank"
									rel="noreferrer"
									title={
										line.logo
											? `${sourceNames[line.logo.source]}: ${line.logo.logo?.file}`
											: "No logo found"
									}
								>
									{line.logo ? "Logo" : "Set logo"}
								</a>
							</LineRow>
						))}
					</Lines>
				</details>
			)}
		</Card>
	)
}

const Page = styled("div", {
	gridColumn: "1 / -1",
	width: "100dvw",
	height: "100dvh",
	overflow: "auto",
	background: theme.cardBackground,
	color: theme.cardText,
	padding: "32px 24px 64px",
	boxSizing: "border-box",

	"& a": {
		color: "inherit",
	},

	"& code": {
		background: theme.cardProminent,
		padding: "1px 4px",
		borderRadius: 4,
	},

	"& summary": {
		cursor: "pointer",
	},
})

const Header = styled("div", {
	maxWidth: 1200,
	margin: "0 auto 24px",
	display: "grid",
	gap: 12,

	"& h1": {
		fontSize: 32,
		margin: 0,
	},

	"& p": {
		margin: "4px 0",
		maxWidth: 720,
	},
})

const BackLink = styled(Link, {
	fontSize: 14,
	textDecoration: "none",
})

const Controls = styled("div", {
	display: "flex",
	flexWrap: "wrap",
	gap: 12,
	alignItems: "center",
})

const Search = styled("input", {
	font: "inherit",
	padding: "8px 12px",
	borderRadius: 8,
	border: `1px solid ${theme.controlNeutralStroke}`,
	background: theme.controlNeutralFill,
	color: "inherit",
	minWidth: 260,
})

const Filters = styled("div", {
	display: "flex",
	flexWrap: "wrap",
	gap: 6,
})

const Filter = styled("button", ({ active }: { active: boolean }) => ({
	font: "inherit",
	fontSize: 14,
	padding: "6px 12px",
	borderRadius: 999,
	cursor: "pointer",
	border: `1px solid ${active ? "transparent" : theme.controlNeutralStroke}`,
	background: active ? theme.controlActiveFill : "transparent",
	color: active ? theme.controlActiveStroke : "inherit",
}))

const Grid = styled("div", {
	maxWidth: 1200,
	margin: "0 auto",
	display: "grid",
	gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
	gap: 16,
	alignItems: "start",
})

const Card = styled("div", {
	background: theme.cardProminent,
	borderRadius: 16,
	padding: 16,
	display: "grid",
	gap: 8,
	scrollMarginTop: 24,

	"&:target": {
		outline: `3px solid ${theme.controlActiveFill}`,
	},
})

const LogoArea = styled("div", {
	display: "flex",
	gap: 8,
	alignItems: "center",
	minHeight: 64,
})

const Placeholder = styled("div", {
	width: 64,
	height: 64,
	borderRadius: 8,
	display: "grid",
	placeItems: "center",
	fontSize: 24,
	fontWeight: "bold",
	textTransform: "uppercase",
	background: theme.cardBackground,
	color: theme.cardTextMuted,
})

const CardHeader = styled("div", {
	display: "grid",
	gap: 2,
})

const Name = styled("div", {
	fontSize: 18,
	fontWeight: "bold",
})

const Muted = styled("div", {
	fontSize: 13,
	color: theme.cardTextMuted,
	display: "inline",
})

const Lines = styled("div", {
	display: "grid",
	gap: 6,
	marginTop: 8,
	maxHeight: 320,
	overflow: "auto",
})

const LineRow = styled("div", {
	display: "grid",
	gridTemplateColumns: "28px 1fr auto",
	alignItems: "center",
	gap: 8,
	fontSize: 14,
})

const Swatch = styled("div", {
	width: 28,
	height: 28,
	borderRadius: 6,
})
