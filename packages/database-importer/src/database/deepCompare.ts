import { isObject } from "./makeSafeForDatabase"

/**
 * return true every entry in the object is a) undefined | null | [] | {} or b) an object that passes the same test recursively
 */
const objectIsDeepUndefined = (
  obj: Record<string | number | symbol, unknown>
): boolean => {
  return Object.values(obj).every(
    value =>
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (isObject(value) && Object.keys(value).length === 0) ||
      (isObject(value) && objectIsDeepUndefined(value))
  )
}

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

  // because of how firebase works, [] and undefined are equal
  if (Array.isArray(a) && a.length === 0) return deepCompare(undefined, b)
  if (Array.isArray(b) && b.length === 0) return deepCompare(a, undefined)

  // same for objects
  if (isObject(a) && Object.keys(a).length === 0)
    return deepCompare(undefined, b)
  if (isObject(b) && Object.keys(b).length === 0)
    return deepCompare(a, undefined)

  // recursively undefined objects are the same as undefined
  if (isObject(a) && objectIsDeepUndefined(a)) return deepCompare(undefined, b)
  if (isObject(b) && objectIsDeepUndefined(b)) return deepCompare(a, undefined)

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

    // if we made it this far, they are equal
    return true
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
