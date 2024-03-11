import { expect, test } from "bun:test"

import mergeData from "./mergeData"

test("mergeData combines two objects", () => {
  const old = { a: 1, b: 2, manual_keys: [] }
  const nu = { b: 3, c: 4, manual_keys: [] }

  const result = mergeData(old, nu)

  expect(result).toEqual({ a: 1, b: 3, c: 4, manual_keys: [] })
})

test("mergeData does not change manual_keys", () => {
  const old = { a: 1, b: 1, manual_keys: ["a", "b"] }
  const nu = { a: 1, b: 1, manual_keys: ["a"] }

  const result = mergeData(old, nu)

  expect(result).toEqual({ a: 1, b: 1, manual_keys: ["a", "b"] })
})

test("mergeData preserves keys from old data", () => {
  const old = { a: 1, b: 1, manual_keys: ["a"] }
  const nu = { a: 2, b: 2, manual_keys: [] }

  const result = mergeData(old, nu)

  expect(result).toEqual({ a: 1, b: 2, manual_keys: ["a"] })
})

test("mergeData doesn't overwrite a value with null", () => {
  const old = { a: 1, b: 1, manual_keys: [] }
  const nu = { a: null, b: 2, manual_keys: [] }

  const result = mergeData(old, nu)

  expect(result).toEqual({ a: 1, b: 2, manual_keys: [] })
})

test("nulls in new data are kept if they don't overwrite old data", () => {
  const old = { a: 1, manual_keys: [] }
  const nu = { a: 2, b: null, manual_keys: [] }

  const result = mergeData(old, nu)

  expect(result).toEqual({ a: 2, b: null, manual_keys: [] })
})

test("mergeData merges deeply", () => {
  const old = { a: { b: 1 }, manual_keys: [] }
  const nu = { a: { c: 2 }, manual_keys: [] }

  const result = mergeData(old, nu)

  expect(result).toEqual({ a: { b: 1, c: 2 }, manual_keys: [] })
})
