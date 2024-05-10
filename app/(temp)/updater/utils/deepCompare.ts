export const isRecord = (
	input: unknown,
): input is Record<string | number | symbol, unknown> => {
	return typeof input === "object" && input !== null && !Array.isArray(input)
}

/**
 * return true every entry in the object is a) undefined | null | [] | {} or b) an object that passes the same test recursively
 * basically anything that would be removed by firebase
 */
const objectIsDeepUndefined = (
	obj: Record<string | number | symbol, unknown>,
): boolean => {
	return Object.values(obj).every(
		(value) =>
			value === undefined ||
			value === null ||
			(Array.isArray(value) && value.length === 0) ||
			(isRecord(value) && Object.keys(value).length === 0) ||
			(isRecord(value) && objectIsDeepUndefined(value)),
	)
}

/**
 * deep compare two objects
 * anything firebase treats as null is considered null (see objectIsDeepUndefined)
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
	if (isRecord(a) && Object.keys(a).length === 0)
		return deepCompare(undefined, b)
	if (isRecord(b) && Object.keys(b).length === 0)
		return deepCompare(a, undefined)

	// recursively undefined objects are the same as undefined
	if (isRecord(a) && objectIsDeepUndefined(a)) return deepCompare(undefined, b)
	if (isRecord(b) && objectIsDeepUndefined(b)) return deepCompare(a, undefined)

	// if one is null or undefined, but not both, they are not equal
	if (a === null || a === undefined || b === undefined) return false

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
		for (const [i, element] of a.entries()) {
			if (!deepCompare(element, b[i])) return false
		}

		// if we made it this far, they are equal
		return true
	}

	// if they are both objects, compare them as objects
	if (isRecord(a) && isRecord(b)) {
		// compare each value
		const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
		let equal = true
		;[...allKeys].forEach((key) => {
			if (!deepCompare(a[key], b[key])) equal = false
		})

		return equal
	}

	// if we get here, they are not equal
	return false
}
