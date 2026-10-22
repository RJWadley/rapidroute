import { expect, test } from "bun:test"
import { isRoutingPath } from "./routeSegments"

const places = new Set([
	"Kyoto",
	"Central+City",
	"MRT-C1",
	"Place 1",
	"Ålesund",
])

test("preserves place, coordinate and player links in supported routing URLs", () => {
	for (const segments of [
		undefined,
		[],
		["place", "Central+City"],
		["place", "Central%2BCity"],
		["place", "Place%201"],
		["place", "%C3%85lesund"],
		["place", "x-100z200"],
		["place", "player-Example_123"],
		["place", "player-.BedrockPlayer"],
		["place", "player-Some%20Player"],
		["navigate", "from", "Kyoto"],
		["navigate", "from", "MRT-C1", "to", "x0z-123"],
		["navigate", "from", "player-Example_123", "to", "Central+City"],
		["navigate", "from", "Central%2BCity", "to", "Kyoto"],
	]) {
		expect(isRoutingPath(segments, places), JSON.stringify(segments)).toBe(true)
	}
})

test("rejects unknown places and malformed routes instead of caching app pages", () => {
	for (const segments of [
		["anything"],
		["place"],
		["place", "not-a-real-place"],
		["place", "Kyoto", "extra"],
		["place", "x1y2"],
		["place", "player-"],
		["place", "player-name%2Fextra"],
		["place", "%E0%A4%A"],
		["navigate", "to", "Kyoto"],
		["navigate", "from", "not-a-real-place"],
		["navigate", "from", "Kyoto", "to"],
		["navigate", "from", "Kyoto", "through", "MRT-C1"],
		["navigate", "from", "Kyoto", "to", "not-a-real-place"],
		["navigate", "from", "Kyoto", "to", "MRT-C1", "extra"],
	]) {
		expect(isRoutingPath(segments, places), JSON.stringify(segments)).toBe(
			false,
		)
	}
})
