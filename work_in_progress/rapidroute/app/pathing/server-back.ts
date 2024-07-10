"use server"

import { findPath } from "."

/**
 * find a path between two locations on the server-side
 */
export const findRouteInServer = async (
	from: string | undefined,
	to: string | undefined,
) => {
	if (!from || !to) return null

	return findPath(from, to)
}
