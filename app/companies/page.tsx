import Registry, { type RegistryCompany } from "app/components/Registry"
import { data } from "app/data"
import { type Logos, resolveLogos } from "app/data/logos"
import type { Metadata } from "next"
import { connection } from "next/server"

// Override the root layout's static-only policy for live wiki discovery.
export const dynamic = "auto"

export const metadata: Metadata = {
	title: "Companies - RapidRoute",
	description:
		"Every airline, rail, ferry, and bus company RapidRoute knows about",
}

export default async function CompaniesPage() {
	await connection()
	let logos: Logos = {}
	try {
		logos = await resolveLogos(data)
	} catch (error) {
		console.error("Company logos are temporarily unavailable", error)
	}

	const companies: RegistryCompany[] = data.companies.list
		.map((company) => ({
			id: company.i,
			name: company.name,
			type: company.type,
			link: "link" in company ? company.link : undefined,
			logo: logos[company.i],
			flightCount: data.flights.list.filter(
				(flight) => flight.airline === company.i,
			).length,
			lines: data.connectionLines.list
				.filter((line) => line.company === company.i)
				.map((line) => ({
					id: line.i,
					name: line.name || line.code,
					code: line.code,
					color: line.color,
					logo: logos[line.i],
				}))
				.sort((a, b) => a.name.localeCompare(b.name)),
		}))
		.sort((a, b) => a.name.localeCompare(b.name))

	return <Registry companies={companies} />
}
