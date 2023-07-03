import { expect, test } from "vitest"

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
