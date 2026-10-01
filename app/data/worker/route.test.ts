import { expect, test } from "bun:test"

test("worker data fits Vercel's response limit and restores routing lookups", async () => {
	// Load server-only data outside the suite's Happy DOM browser environment.
	const workerCheck = Bun.spawn(
		[
			process.execPath,
			"--eval",
			`
		import { isDeepStrictEqual } from "node:util";
		import SuperJSON from "superjson";
		import * as data from "./app/data/format";
		import { GET } from "./app/data/worker/route";
		const body = await GET().text();
		const restored = SuperJSON.parse(body);
		const collections = Object.values(restored).filter(value => "list" in value);
		console.log(JSON.stringify({
			bytes: new TextEncoder().encode(body).byteLength,
			contentsMatch: isDeepStrictEqual(restored, {...data}),
			lookupsMatch: collections.every(({list, map}) =>
				map instanceof Map && list.every(node => map.get(node.i) === node)),
			spawnMatches: restored.places.map instanceof Map &&
				restored.places.map.get(restored.spawn.i) === restored.spawn,
		}));
		`,
		],
		{ stdout: "pipe", stderr: "pipe" },
	)
	const [exitCode, stdout, stderr] = await Promise.all([
		workerCheck.exited,
		new Response(workerCheck.stdout).text(),
		new Response(workerCheck.stderr).text(),
	])
	expect(exitCode, stderr).toBe(0)
	const result = JSON.parse(stdout) as {
		bytes: number
		contentsMatch: boolean
		lookupsMatch: boolean
		spawnMatches: boolean
	}
	expect(result.bytes).toBeLessThan(20_000_000)
	expect(result.contentsMatch).toBe(true)
	expect(result.lookupsMatch).toBe(true)
	expect(result.spawnMatches).toBe(true)
})
