import { isObject } from "./makeSafeForDatabase"

/**
 * deep compare two objects
 * null and undefined are considered equal
 */
export default function deepCompare(a: unknown, b: unknown): boolean {
  // first just do an equality check
  if (a === b) return true

  // null and undefined are equal
  if (a === null && b === undefined) return true
  if (a === undefined && b === null) return true

  // if one is null or undefined, but not both, they are not equal
  if (a === null || a === undefined || b === null || b === undefined)
    return false

  // if they are not the same type, they are not equal
  if (typeof a !== typeof b) return false

  // if they are not both objects, they are not equal
  if (typeof a !== "object" || typeof b !== "object") return false

  // if they are not both arrays, they are not equal
  if (Array.isArray(a) !== Array.isArray(b)) return false

  // if they are both arrays, compare them as arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    // if they are not the same length, they are not equal
    if (a.length !== b.length) return false

    // compare each element
    for (let i = 0; i < a.length; i += 1) {
      if (!deepCompare(a[i], b[i])) return false
    }
  }

  // if they are both objects, compare them as objects
  if (isObject(a) && isObject(b)) {
    // compare each value
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
    let equal = true
    Array.from(allKeys).forEach(key => {
      if (!deepCompare(a[key], b[key])) equal = false
    })

    return equal
  }

  // if we get here, they are not equal
  return false
}
