/**
 * given a list of strings, return a new list with all duplicates removed
 */
export const getUnique = <T>(arr: T[]): T[] => {
	return [...new Set(arr)]
}
