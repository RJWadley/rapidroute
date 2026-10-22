import { expect, test } from "bun:test"

test("plain worker data preserves the real dataset, shared lookups and routes", async () => {
	// Load server-only data outside the suite's Happy DOM browser environment.
	const workerCheck = Bun.spawn(
		[
			process.execPath,
			"--eval",
			`
		import assert from "node:assert/strict";
		import SuperJSON from "superjson";
		import * as data from "./app/data/format";
		import { GET } from "./app/data/worker/v2/route";
		import { GET as legacyGET } from "./app/data/worker/route";
		import { parseWorkerData } from "./app/data/worker/transport";
		import { findPath } from "./app/pathing";
		import { exclusionPresets } from "./app/pathing/presets";
		import { getCompressedPlaces } from "./app/utils/compressedPlaces";
		const legacy = await legacyGET().text();
		assert.deepStrictEqual(SuperJSON.parse(legacy), { ...data }, "legacy worker protocol");
		const body = await GET().text();
		const restored = parseWorkerData(body);
		const plain = value => JSON.parse(JSON.stringify(value));
		const collections = ["places", "gates", "flights", "companies", "connectionLines", "spawnWarps"];
		for (const name of collections) {
			const { list, map } = restored[name];
			// Compare every defined value, including nested connections and proximity.
			// Own properties containing undefined intentionally disappear in JSON.
			assert.deepStrictEqual(list, plain(data[name].list), name);
			assert(map instanceof Map, name);
			assert.equal(map.size, data[name].map.size, name);
			assert.deepStrictEqual([...map.keys()], [...data[name].map.keys()], name);
			for (const node of list) assert.equal(map.get(node.i), node, name);
		}
		assert.equal(restored.spawn, restored.places.map.get(data.spawn.i));
		for (const warp of restored.spawnWarps.list)
			assert.equal(warp, restored.places.map.get(warp.i));
		assert.deepStrictEqual(getCompressedPlaces(restored), getCompressedPlaces(data));

		const cases = [];
		for (const type of ["RailStation", "SeaStop", "BusStop"]) {
			const from = data.places.list.find(p => p.type === type && Object.keys(p.connections).length);
			const to = from && data.places.map.get(Object.keys(from.connections)[0]);
			assert(from && to, type);
			const via = { RailStation: "RailLine", SeaStop: "SeaLine", BusStop: "BusLine" }[type];
			cases.push([from.pretty_id, to.pretty_id, exclusionPresets.default, via]);
			if (type === "RailStation") cases.push([from.pretty_id, to.pretty_id, exclusionPresets.classic, via]);
		}
		const airports = data.flights.list
			.map(flight => [...new Set(flight.gates.map(id => data.gates.map.get(id)?.airport))]
				.map(id => data.places.map.get(id)).filter(Boolean))
			.find(airports => airports.length >= 2);
		assert(airports);
		cases.push([airports[0].pretty_id, airports[1].pretty_id, exclusionPresets.default, "AirFlight"]);
		const warp = data.spawnWarps.list.find(warp => warp.coordinates);
		assert(warp?.coordinates);
		const warpDestination = "x" + Math.round(warp.coordinates[0]) + "z" + Math.round(warp.coordinates[1]);
		cases.push([data.spawn.pretty_id, warpDestination, {
			...exclusionPresets.default,
			SpawnWarp: { portal: false, premier: false, terminus: false, traincarts: false, misc: false },
		}, "SpawnWarp"]);
		cases.push(["x0z0", "x20z20", exclusionPresets.default, "Walk"]);
		for (const [from, to, exclusions, via] of cases) {
			const original = findPath(from, to, exclusions, data);
			const roundtrip = findPath(from, to, exclusions, restored);
			assert(original?.length > 0, from + " to " + to);
			assert(original.some(route => route.path.some(leg => leg.options.some(option => option.type === via))), via);
			assert.deepStrictEqual(plain(roundtrip), plain(original), from + " to " + to);
		}
		console.log(JSON.stringify({
			bytes: new TextEncoder().encode(body).byteLength,
			legacyBytes: new TextEncoder().encode(legacy).byteLength,
			routeCases: cases.length,
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
		legacyBytes: number
		routeCases: number
	}
	expect(result.bytes).toBeLessThan(6_000_000)
	expect(result.bytes).toBeLessThan(result.legacyBytes / 2)
	expect(result.routeCases).toBe(7)
})
