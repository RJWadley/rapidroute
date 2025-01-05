export const placesMatch = (
	a: { i: string | null | undefined },
	b: { i: string | null | undefined },
) => (typeof a.i === "string" && typeof b.i === "string" ? a.i === b.i : false)
