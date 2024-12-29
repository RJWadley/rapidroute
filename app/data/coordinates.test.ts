import { test, expect } from "bun:test"
import { parseCoordinate } from "./coordinates"

// parseCoordinateId

test("can parse coordinates", () => {
	expect(parseCoordinate("x1z1")).toEqual({
		type: "Coordinate",
		i: "x1z1",
		id: "x1z1",
		coordinates: [1, 1],
		world: "New",
	})
	expect(parseCoordinate("x100z100")).toEqual({
		type: "Coordinate",
		i: "x100z100",
		id: "x100z100",
		coordinates: [100, 100],
		world: "New",
	})
})

test("returns null if no coordinates", () => {
	// uses y instead of z
	expect(parseCoordinate("x1y1")).toBeNull()
	// uses letters instead of numbers
	expect(parseCoordinate("x1z1a")).toBeNull()
	// unrelated string
	expect(parseCoordinate("hello world")).toBeNull()
})

// parseCoordinateQuery

test("can parse comma", () => {
	expect(parseCoordinate("1, 1")).toEqual({
		type: "Coordinate",
		i: "x1z1",
		id: "x1z1",
		coordinates: [1, 1],
		world: "New",
	})
})

test("can parse comma compact", () => {
	expect(parseCoordinate("1,1")).toEqual({
		type: "Coordinate",
		i: "x1z1",
		id: "x1z1",
		coordinates: [1, 1],
		world: "New",
	})
})

test("can parse comma within content", () => {
	expect(parseCoordinate("hello 1, 1 world")).toEqual({
		type: "Coordinate",
		i: "x1z1",
		id: "x1z1",
		coordinates: [1, 1],
		world: "New",
	})
	expect(parseCoordinate("hello 1,1 world")).toEqual({
		type: "Coordinate",
		i: "x1z1",
		id: "x1z1",
		coordinates: [1, 1],
		world: "New",
	})
})

test("can parse comma negatives", () => {
	expect(parseCoordinate("-1, -1")).toEqual({
		type: "Coordinate",
		i: "x-1z-1",
		id: "x-1z-1",
		coordinates: [-1, -1],
		world: "New",
	})
})

test("can parse period", () => {
	expect(parseCoordinate("100.100")).toEqual({
		type: "Coordinate",
		i: "x100z100",
		id: "x100z100",
		coordinates: [100, 100],
		world: "New",
	})
})

test("can parse underscore", () => {
	expect(parseCoordinate("100_100")).toEqual({
		type: "Coordinate",
		i: "x100z100",
		id: "x100z100",
		coordinates: [100, 100],
		world: "New",
	})
})

test("can parse space", () => {
	expect(parseCoordinate("100 100")).toEqual({
		type: "Coordinate",
		i: "x100z100",
		id: "x100z100",
		coordinates: [100, 100],
		world: "New",
	})
})

test("can parse with two separators", () => {
	expect(parseCoordinate("1.000, 1.000")).toEqual({
		type: "Coordinate",
		i: "x1000z1000",
		id: "x1000z1000",
		coordinates: [1000, 1000],
		world: "New",
	})
})

test("can parse with three separators", () => {
	expect(parseCoordinate("1_000, 1.000")).toEqual({
		type: "Coordinate",
		i: "x1000z1000",
		id: "x1000z1000",
		coordinates: [1000, 1000],
		world: "New",
	})
})

test("can parse with two separators and negatives", () => {
	expect(parseCoordinate("-1.000, -1.000")).toEqual({
		type: "Coordinate",
		i: "x-1000z-1000",
		id: "x-1000z-1000",
		coordinates: [-1000, -1000],
		world: "New",
	})
})

test("can parse with three separators and negatives", () => {
	expect(parseCoordinate("-1_000, -1.000")).toEqual({
		type: "Coordinate",
		i: "x-1000z-1000",
		id: "x-1000z-1000",
		coordinates: [-1000, -1000],
		world: "New",
	})
})
