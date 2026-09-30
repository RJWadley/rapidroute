import { afterEach, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import Registry, { type RegistryCompany } from "./Registry"

afterEach(cleanup)

const company: RegistryCompany = {
	id: "company",
	name: "Test Rail",
	type: "RailCompany",
	flightCount: 0,
	lines: [{ id: "line", name: "Central Line", code: "C", color: "#ff0000" }],
}

test("a missing line logo shows its code instead of a blank square", () => {
	render(<Registry companies={[company]} />)
	expect(screen.getByText("C")).toBeDefined()
})

test("a wide line logo is displayed rather than replaced with a color", () => {
	const logo = {
		source: "line logo" as const,
		logo: {
			file: "Central_logo.png",
			url: "https://example.com/logo.png",
			page: "https://example.com/File:logo.png",
			width: 400,
			height: 100,
		},
	}
	render(
		<Registry
			companies={[
				{
					...company,
					lines: [{ id: "line", name: "Central Line", code: "C", logo }],
				},
			]}
		/>,
	)
	expect(screen.getByAltText("Central Line logo")).toBeDefined()
})

test("wiki guesses link to their article and image file separately", () => {
	const image = {
		file: "Company_logo.png",
		url: "https://example.com/logo.png",
		page: "https://example.com/File:Company_logo.png",
		width: 100,
		height: 100,
	}
	render(
		<Registry
			companies={[
				{
					...company,
					logo: {
						source: "AI guess",
						logo: image,
						sourcePage: {
							title: "Actual wiki article",
							url: "https://example.com/Actual_article",
						},
					},
				},
			]}
		/>,
	)
	expect(
		screen
			.getByRole("link", { name: "Actual wiki article" })
			.getAttribute("href"),
	).toBe("https://example.com/Actual_article")
	expect(
		screen.getByRole("link", { name: "Image file" }).getAttribute("href"),
	).toBe(image.page)
})

test("a CSS color unsupported by the contrast helper does not break the registry", () => {
	render(
		<Registry
			companies={[
				{
					...company,
					lines: [
						{
							id: "line",
							name: "Central Line",
							code: "C",
							color: "CornflowerBlue",
						},
					],
				},
			]}
		/>,
	)
	expect(screen.getByText("C")).toBeDefined()
})
