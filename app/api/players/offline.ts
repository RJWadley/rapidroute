import { z } from "zod"
import type { OfflinePlayer } from "./type"

// Member List (Public), member tab. Tab 0 contains totals, not usernames.
const directoryUrl =
	"https://docs.google.com/spreadsheets/d/1Hhj_Cghfhfs8Xh5v5gt65kGc4mDW0sC5GWULKidOBW8/gviz/tq?gid=1267599469&headers=1&tq=select%20B&tqx=out:json"
const directorySchema = z.object({
	status: z.literal("ok"),
	table: z.object({
		cols: z.tuple([z.object({ label: z.literal("Username") })]),
		rows: z.array(
			z.object({
				c: z.tuple([
					z
						.object({ v: z.union([z.string(), z.number()]).nullable() })
						.nullable(),
				]),
			}),
		),
	}),
})

export const getOfflinePlayers = async (): Promise<
	Record<string, OfflinePlayer>
> => {
	try {
		const response = await fetch(directoryUrl, {
			cache: "force-cache",
			next: { revalidate: 3600 },
			signal: AbortSignal.timeout(10000),
		})
		if (!response.ok)
			throw new Error(`Member spreadsheet returned HTTP ${response.status}`)
		if (response.headers.get("content-type")?.includes("text/html"))
			throw new Error("Member spreadsheet returned text/html instead of data")

		// Google wraps the JSON in a callback. Parse it without executing JavaScript.
		const json = (await response.text()).match(
			/^\s*(?:\/\*O_o\*\/\s*)?google\.visualization\.Query\.setResponse\(([\s\S]*)\);\s*$/,
		)?.[1]
		if (!json) throw new Error("Unexpected member spreadsheet response format")
		const data = directorySchema.parse(JSON.parse(json))

		return Object.fromEntries(
			data.table.rows
				.map((row) => row.c[0]?.v?.toString().trim())
				.filter((username): username is string => !!username)
				.sort(() => Math.random() - 0.5)
				.map(
					(username) =>
						[
							`player-${username.toLowerCase()}`,
							{
								id: `player-${username.toLowerCase()}`,
								isOnline: false,
								type: "Player",
								username,
							} satisfies OfflinePlayer,
						] as const,
				),
		)
	} catch (error) {
		// An unavailable directory must not take down station or online-player search.
		console.error("failed to fetch offline players", error)
		return {}
	}
}
